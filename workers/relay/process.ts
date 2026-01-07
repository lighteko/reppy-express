import initLogger from "src/logger";
import Streaming from "lib/infra/streaming";
import { handler } from "workers/relay/handler";

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// OCI Streaming record value가 base64인 경우가 많아서 디코딩 시도
function extractContent(m: any): any {
    const raw = m?.value ?? m?.message?.value ?? m?.content ?? m?.message?.content ?? m;
    if (typeof raw !== "string") return raw;

    // base64 디코딩 시도
    try {
        const decoded = Buffer.from(raw, "base64").toString("utf-8");
        // decoded가 사람이 읽을만하면 decoded, 아니면 raw
        return decoded && decoded.trim().length ? decoded : raw;
    } catch {
        return raw;
    }
}

export async function runRelay(opts: { cfg: any; signal: AbortSignal }) {
    const logger = initLogger("debug");
    const stream = Streaming.getInstance();

    const meta = opts.cfg.STREAMS.result; // { streamId, name?, partition? ... }
    if (!meta?.streamId) throw new Error("cfg.STREAMS.result.streamId is required");

    const limit = opts.cfg.RELAY_STREAM_LIMIT ?? 200;
    const idleSleepMs = opts.cfg.RELAY_IDLE_SLEEP_MS ?? 50;
    const backoffMs = opts.cfg.RELAY_BACKOFF_MS ?? 500;

    const cursorType = opts.cfg.RELAY_CURSOR_TYPE ?? "LATEST"; // "LATEST" | "TRIM_HORIZON"

    // ✅ cursor 생성 (wrapper의 createCursor 사용)
    let cursor = await stream.createCursor({
        ...meta,
        cursorType,
    });

    logger.info(
        `relay started streamId=${meta.streamId}${meta.name ? ` name=${meta.name}` : ""}${
            meta.partition ? ` partition=${meta.partition}` : ""
        }`
    );

    while (!opts.signal.aborted) {
        try {
            // ✅ getRecords가 맞음 (getMessages 아님)
            const { messages, nextCursor } = await stream.getRecords({
                streamId: meta.streamId,
                name: meta.name,
                cursor,
                limit,
            });

            if (!messages.length) {
                if (nextCursor) cursor = nextCursor;
                await sleep(idleSleepMs);
                continue;
            }

            // 메시지 파싱
            const parsedEvents: any[] = [];
            for (const m of messages) {
                const content = extractContent(m);
                try {
                    const parsed = typeof content === "string" ? JSON.parse(content) : content;
                    parsedEvents.push(parsed);
                } catch (e) {
                    logger.error(`stream message JSON parse failed: ${String((e as any)?.message ?? e)}`);
                    // 파싱 실패는 보통 스킵하고 커서 진행(안 그러면 무한 루프 가능)
                }
            }

            if (parsedEvents.length) {
                // ✅ gateway 전송 성공해야 커서 진행(=commit 개념)
                await handler(parsedEvents, opts.cfg, opts.signal);
            }

            // ✅ 성공/스킵 처리가 끝났으면 nextCursor로 진행
            if (nextCursor) cursor = nextCursor;
        } catch (err) {
            logger.error(`relay loop error: ${String((err as any)?.message ?? err)}`);
            // 실패 시 커서 그대로 유지 → 같은 레코드 재시도(at-least-once)
            await sleep(backoffMs);
        }
    }

    logger.info("relay loop stopped");
}

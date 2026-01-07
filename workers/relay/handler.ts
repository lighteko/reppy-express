import initLogger from "src/logger";

type RelayEvent = {
    requestId: string;
    seq?: number;            // token sequence (optional)
    type?: string;           // e.g. "TOKEN" | "DONE" | "ERROR"
    token?: string;          // token text
    payload?: any;           // optional
};

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

async function postJson(url: string, body: any, timeoutMs = 5000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            throw new Error(`gateway responded ${resp.status}: ${text}`);
        }
    } finally {
        clearTimeout(t);
    }
}

// 간단 중복 제거: requestId별 lastSeq 기억
const lastSeqByRequest = new Map<string, number>();

function shouldDrop(e: RelayEvent): boolean {
    if (!e.requestId) return false;
    if (typeof e.seq !== "number") return false;
    const last = lastSeqByRequest.get(e.requestId);
    if (last == null) {
        lastSeqByRequest.set(e.requestId, e.seq);
        return false;
    }
    if (e.seq <= last) return true;
    lastSeqByRequest.set(e.requestId, e.seq);
    return false;
}

export async function handler(events: any[], cfg: any, signal: AbortSignal) {
    const logger = initLogger("debug");

    // ✅ gateway internal endpoint
    const base = cfg.GATEWAY_INTERNAL_BASE_URL ?? cfg.INTERNAL_GATEWAY_URL ?? "http://localhost:3000";
    const path = cfg.RELAY_GATEWAY_PATH ?? "/internal/relay/stream";
    const url = `${base}${path}`;

    // 배치 크기/재시도
    const maxRetries = cfg.RELAY_HTTP_MAX_RETRIES ?? 3;
    const retryBaseMs = cfg.RELAY_HTTP_RETRY_BASE_MS ?? 200;
    const timeoutMs = cfg.RELAY_HTTP_TIMEOUT_MS ?? 5000;

    // 타입 보정 + 중복 제거
    const normalized: RelayEvent[] = [];
    for (const raw of events) {
        const e = raw as RelayEvent;

        if (!e?.requestId) continue; // requestId 없는 건 버리자 (SSE 라우팅 불가)
        if (shouldDrop(e)) continue;

        normalized.push(e);
    }

    if (!normalized.length) return;

    // 게이트웨이가 한 번에 처리하기 쉽도록 payload 포맷 통일
    const payload = {
        ts: Date.now(),
        events: normalized,
    };

    let lastErr: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (signal.aborted) throw new Error("relay aborted");

        try {
            await postJson(url, payload, timeoutMs);
            logger.debug(`relay pushed events=${normalized.length} -> ${url}`);
            return;
        } catch (err) {
            lastErr = err;
            const isLast = attempt === maxRetries;
            logger.error(`relay push failed (attempt ${attempt + 1}/${maxRetries + 1}): ${String((err as any)?.message ?? err)}`);
            if (isLast) break;
            await sleep(retryBaseMs * Math.pow(2, attempt));
        }
    }

    throw lastErr;
}

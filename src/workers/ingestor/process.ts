import initLogger from "@src/logger";
import Queues from "@lib/infra/queues";
import { handler } from "@src/workers/ingestor/handler";
import { RoutinesDAO } from "@src/routines/dao/dao";
import { WorkerService } from "@src/workers/repository/service/service";

// oci-queue sdk 응답이 버전/타입에 따라 달라서 안전하게 파싱
function extractMessages(resp: any): any[] {
    // 가장 흔한 후보들
    return (
        resp?.messages ??
        resp?.getMessages?.messages ??
        resp?.items ??
        resp?.data?.messages ??
        []
    );
}

function extractReceipt(m: any): string | undefined {
    return m?.receipt ?? m?.message?.receipt;
}

function extractContent(m: any): any {
    return m?.content ?? m?.message?.content ?? m;
}

export async function runIngestor(opts: { cfg: any; signal: AbortSignal }) {
    const logger = initLogger("debug");
    const queues = Queues.getInstance();

    const meta = opts.cfg.QUEUES.result;

    // 튜닝 파라미터
    const limit = 10;
    const timeoutInSeconds = 20; // long polling
    const visibilityInSeconds = 60; // 처리 시간보다 길게
    const idleSleepMs = 200; // 메시지 없을 때 쉴 시간

    logger.info(
        `ingestor started queueId=${meta.queueId}${meta.channel ? ` channel=${meta.channel}` : ""}`
    );

    while (!opts.signal.aborted) {
        try {
            const resp: any = await queues.getMessages({
                ...meta,
                limit,
                timeoutInSeconds,
                visibilityInSeconds,
            });

            const messages = extractMessages(resp);
            if (!messages.length) {
                await new Promise((r) => setTimeout(r, idleSleepMs));
                continue;
            }

            const receiptsToDelete: string[] = [];
            const service = new WorkerService()
            const dao = new RoutinesDAO();

            for (const m of messages) {
                try {
                    const content = extractContent(m);
                    const receipt = extractReceipt(m);

                    const parsed = typeof content === "string" ? JSON.parse(content) : content;

                    await handler(parsed, service, dao);

                    if (receipt) receiptsToDelete.push(receipt);
                } catch (err) {
                    logger.error(`message process failed: ${String((err as any)?.message ?? err)}`);
                }
            }

            if (receiptsToDelete.length) {
                await queues.deleteMessages(receiptsToDelete, meta);
            }
        } catch (err) {
            logger.error(`poll loop error: ${String((err as any)?.message ?? err)}`);
            await new Promise((r) => setTimeout(r, 500));
        }
    }

    logger.info("ingestor loop stopped");
}

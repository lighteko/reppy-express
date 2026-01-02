import { BaseConfig } from "@lib/config";
import DB from "@lib/infra/postgres";
import Tokens from "@lib/infra/tokens";
import Queues from "@lib/infra/queues";
import ObjectStorage from "@lib/infra/objectstorage";
import { runIngestor } from "@src/workers/ingestor/process";
import initLogger from "@src/logger";


async function main() {
    const logger = initLogger("debug");
    const cfg = BaseConfig.init();
    DB.init(cfg);
    Tokens.init(cfg);
    await Queues.init(cfg);
    await ObjectStorage.init(cfg);

    logger.info("worker initialized");

    // graceful shutdown 플래그
    const controller = new AbortController();

    const shutdown = async (signal: string) => {
        logger.warn(`shutdown requested: ${signal}`);
        controller.abort();

        logger.warn("shutdown complete");
        process.exit(0);
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));

    await runIngestor({ cfg, signal: controller.signal });
}

await main();

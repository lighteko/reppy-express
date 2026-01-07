import { BaseConfig } from "lib/config";
import DB from "lib/infra/postgres";
import Tokens from "lib/infra/tokens";
import ObjectStorage from "lib/infra/objectstorage";
import initLogger from "src/logger";
import Streaming from "lib/infra/streaming";
import { runRelay } from "workers/relay/process";

async function main() {
    const logger = initLogger("debug");

    const cfg = BaseConfig.init();

    // relay가 DB 안 쓰면 DB.init 빼도 됨 (공유 코드베이스면 둬도 됨)
    DB.init(cfg);
    Tokens.init(cfg);
    await ObjectStorage.init(cfg); // relay가 objectstorage 안 쓰면 빼도 됨
    await Streaming.init(cfg);

    logger.info("relay worker initialized");

    const controller = new AbortController();

    const shutdown = async (signal: string) => {
        logger.warn(`shutdown requested: ${signal}`);
        controller.abort();
        logger.warn("shutdown complete");
        process.exit(0);
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));

    await runRelay({ cfg, signal: controller.signal });
}

await main();

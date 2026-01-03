import { BaseConfig } from "@lib/config";
import initLogger from "@src/logger";
import DB from "@lib/infra/postgres";
import Tokens from "@lib/infra/tokens";
import Queues from "@lib/infra/queues";
import ObjectStorage from "@lib/infra/objectstorage";


async function main() {
    const logger = initLogger("debug");

    const cfg = BaseConfig.init();
    DB.init(cfg);
    Tokens.init(cfg)
    await Queues.init(cfg);
    await ObjectStorage.init(cfg);
}

await main();

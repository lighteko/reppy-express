import 'reflect-metadata';
import createApp from "@src/app";

async function main() {
    const EXPRESS_PORT = parseInt(process.env.EXPRESS_PORT || "3000");
    const app = await createApp();
    app.listen(EXPRESS_PORT, "0.0.0.0", () => {
        console.log(`\n* Server running on http://127.0.0.1:${EXPRESS_PORT}\n`);
    });
}

await main();

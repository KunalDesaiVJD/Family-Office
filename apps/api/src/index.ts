// Entry point: load config, build the connector + server, start listening.

import { loadEnv } from "./config/env";
import { AngelOneConnector } from "./connectors/angelOne";
import { createServer } from "./server";
import { logger } from "./lib/logger";

const env = loadEnv();
const connector = new AngelOneConnector(env.angel);
const app = createServer(env, connector);

app.listen(env.port, () => {
  logger.info("server.listening", { port: env.port });
});

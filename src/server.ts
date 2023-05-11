import dotenv from "dotenv";
import fastify, { FastifyBaseLogger, FastifyServerOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import initConfig from "./configs";
import { PORT } from "./constants";
import routes from "./routes";
dotenv.config();

async function main() {
  try {
    const app = await build();
    const address = await app.listen({ port: PORT });
    console.log(`Server running on ${address}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function build(
  options?: FastifyServerOptions<
    Server<typeof IncomingMessage, typeof ServerResponse>,
    FastifyBaseLogger
  >
) {
  const app = fastify(options);
  await initConfig(app);
  app.register(routes, { prefix: "/api" });
  return app;
}

main();

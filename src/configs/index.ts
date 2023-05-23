import { FastifyInstance } from "fastify";
import configCORS from "./cors";
import configMultipart from "./multipart";

async function initConfig(fastify: FastifyInstance) {
  await configCORS(fastify);
  await configMultipart(fastify);
}

export default initConfig;

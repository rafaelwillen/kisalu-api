import { FastifyInstance } from "fastify";
import configCORS from "./cors";
import configEnv from "./env";

async function initConfig(fastify: FastifyInstance) {
  await configEnv(fastify);
  await configCORS(fastify);
}

export default initConfig;

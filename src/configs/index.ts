import { FastifyInstance } from "fastify";
import configCORS from "./cors";

async function initConfig(fastify: FastifyInstance) {
  await configCORS(fastify);
}

export default initConfig;

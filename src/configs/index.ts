import { FastifyInstance } from "fastify";
import configCookies from "./cookie";
import configCORS from "./cors";
import configJWT from "./jwt";
import configMultipart from "./multipart";

async function initConfig(fastify: FastifyInstance) {
  await configCORS(fastify);
  await configMultipart(fastify);
  await configJWT(fastify);
  await configCookies(fastify);
}

export default initConfig;

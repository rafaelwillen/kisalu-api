import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

async function configCORS(fastify: FastifyInstance) {
  fastify.register(fastifyCors);
}

export default configCORS;

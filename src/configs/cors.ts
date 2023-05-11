import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

function configCORS(fastify: FastifyInstance) {
  fastify.register(fastifyCors);
}

export default configCORS;

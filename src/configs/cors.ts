import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

async function configCORS(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://kisalu.live"
        : "http://localhost:3000",
    credentials: true,
  });
}

export default configCORS;

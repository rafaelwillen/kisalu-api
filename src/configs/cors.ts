import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

async function configCORS(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin: [
      /^http:\/\/localhost:/,
      "https://kisalu.live",
      /rafaelwillen\.vercel\.app$/,
    ],
    credentials: true,
  });
}

export default configCORS;

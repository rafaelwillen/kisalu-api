import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

async function configCORS(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin: [
      "http://localhost:3000",
      "https://kisalu.live",
      /rafaelwillen\.vercel\.app$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });

}

export default configCORS;

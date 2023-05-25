import fastifyJWT from "@fastify/jwt";
import { FastifyInstance } from "fastify";

export default async function configJWT(app: FastifyInstance) {
  app.register(fastifyJWT, {
    secret: process.env.JWT_SECRET_KEY,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });
}

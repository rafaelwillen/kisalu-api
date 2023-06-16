import fastifyCookie from "@fastify/cookie";
import { FastifyInstance } from "fastify";

export default async function configCookies(fastify: FastifyInstance) {
  fastify.register(fastifyCookie);
}

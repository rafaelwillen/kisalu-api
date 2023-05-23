import { FastifyInstance } from "fastify";
import adminRoutes from "./admin";

async function routes(fastify: FastifyInstance) {
  fastify.get("/", (_, reply) => {
    reply.send({
      message: "Server Online",
    });

    fastify.register(adminRoutes, { prefix: "/admin" });
  });
}

export default routes;

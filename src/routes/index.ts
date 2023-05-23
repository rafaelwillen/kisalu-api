import { FastifyInstance } from "fastify";
import adminRoutes from "./admin";

async function routes(
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.register(adminRoutes, { prefix: "/admin" });
  fastify.get("/", (_, reply) => {
    reply.send({
      message: "Server Online",
    });
  });
  done();
}

export default routes;

import { FastifyInstance } from "fastify";
import adminRoutes from "./admin";
import uploadRoutes from "./upload";

async function routes(
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.register(adminRoutes, { prefix: "/admin" });
  fastify.register(uploadRoutes, { prefix: "/upload" });
  fastify.get("/", (_, reply) => {
    reply.send({
      message: "Server Online",
    });
  });
  done();
}

export default routes;

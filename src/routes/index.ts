import { FastifyInstance } from "fastify";
import addressRoutes from "./address";
import adminRoutes from "./admin";
import authenticationRoutes from "./auth";
import categoryRoutes from "./category";
import clientRoutes from "./client";
import providerRoutes from "./provider";
import uploadRoutes from "./upload";

async function routes(
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.register(adminRoutes, { prefix: "/admin" });
  fastify.register(uploadRoutes, { prefix: "/upload" });
  fastify.register(authenticationRoutes, { prefix: "/auth" });
  fastify.register(addressRoutes, { prefix: "/address" });
  fastify.register(categoryRoutes, { prefix: "/categories" });
  fastify.register(clientRoutes, { prefix: "/client" });
  fastify.register(providerRoutes, { prefix: "/provider" });

  fastify.get("/", (_, reply) => {
    reply.send({
      message: "Server Online",
    });
  });
  done();
}

export default routes;

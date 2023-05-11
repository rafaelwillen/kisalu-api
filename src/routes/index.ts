import { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance) {
  fastify.get("/", (_, reply) => {
    reply.send({
      message: "Server Online",
    });
  });
}

export default routes;

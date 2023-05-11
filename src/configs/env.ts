import fastifyEnv from "@fastify/env";
import { FastifyInstance } from "fastify";

async function configEnv(fastify: FastifyInstance) {
  const options = {
    dotenv: true,
    schema: {
      type: "object",
      required: ["PORT"],
      properties: {
        PORT: {
          type: "string",
          default: 3500,
        },
      },
    },
  };

  fastify.register(fastifyEnv, options);
}

export default configEnv;

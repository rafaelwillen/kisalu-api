import cors from "@fastify/cors";
import fastify, { FastifyBaseLogger, FastifyServerOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

function build(
  options?: FastifyServerOptions<
    Server<typeof IncomingMessage, typeof ServerResponse>,
    FastifyBaseLogger
  >
) {
  const app = fastify(options);

  // Add module config
  app.register(cors);

  // Add Custom configs

  // Add routes here

  return app;
}

export default build;
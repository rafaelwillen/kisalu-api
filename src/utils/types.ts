import { FastifyReply, FastifyRequest } from "fastify";

export type FastifyHookFunction = (
  request: FastifyRequest,
  reply: FastifyReply,
  done?: (err?: Error) => void
) => Promise<void> | void;

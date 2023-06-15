import { HTTP_STATUS_CODE } from "@/constants";
import Repository from "@/repository/Repository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply } from "fastify";
import { ZodError } from "zod";

export function handleServiceError(
  error: unknown,
  repositories: Repository[],
  reply: FastifyReply
) {
  repositories.forEach((repository) => repository.close());
  console.error(error, "Error from service");
  if (error instanceof ZodError)
    return reply.code(HTTP_STATUS_CODE.BAD_REQUEST).send(error.errors);
  if (error instanceof HTTPError)
    return reply.code(error.statusCode).send({
      message: error.message,
    });
  return reply.code(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
    message: "Internal Server Error",
  });
}

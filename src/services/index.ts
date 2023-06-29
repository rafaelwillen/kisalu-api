import { HTTP_STATUS_CODE } from "@/constants";
import Repository from "@/repository/Repository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { FirebaseError } from "firebase/app";
import z, { ZodError } from "zod";

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

export function handleUploadError(error: unknown, reply: FastifyReply) {
  console.error(error, "Error from file upload");
  if (error instanceof ZodError)
    return reply.code(HTTP_STATUS_CODE.BAD_REQUEST).send(error.errors);
  if (error instanceof HTTPError)
    return reply.code(error.statusCode).send({
      message: error.message,
    });
  if (error instanceof FirebaseError) {
    if (error.code === "storage/unauthorized")
      return reply.code(HTTP_STATUS_CODE.UNAUTHORIZED).send({
        message: "Unauthorized access to Firebase Storage",
      });
    if (error.code === "storage/object-not-found")
      return reply.code(HTTP_STATUS_CODE.NOT_FOUND).send({
        message: "Object not found in Firebase Storage",
      });
  }
}

export function parseIdParams(request: FastifyRequest) {
  const schema = z.object({
    id: z.string().uuid(),
  });
  return schema.parse(request.params);
}

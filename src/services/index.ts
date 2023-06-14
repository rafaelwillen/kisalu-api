import { HTTP_STATUS_CODE } from "@/constants";
import Repository from "@/repository/Repository";
import { FastifyReply } from "fastify";
import { ZodError } from "zod";

export { default as AdministratorService } from "./AdministratorService";
export { default as AuthenticationService } from "./AuthenticationService";
export { default as CategoryService } from "./CategoryService";
export { default as UploadService } from "./UploadService";

export function handleServiceError(
  error: unknown,
  repositories: Repository[],
  reply: FastifyReply
) {
  repositories.forEach((repository) => repository.close());
  if (error instanceof ZodError)
    return reply.code(HTTP_STATUS_CODE.BAD_REQUEST).send(error.errors);
  console.error(error, "Category Service error");
  return reply.code(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
    message: "Internal Server Error",
  });
}

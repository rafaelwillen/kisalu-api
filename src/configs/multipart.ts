import { MAX_FILE_SIZE } from "@/constants";
import multipart from "@fastify/multipart";
import { FastifyInstance } from "fastify";

export default async function configMultipart(app: FastifyInstance) {
  app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });
}

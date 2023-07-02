import UploadService from "@/services/UploadService";
import { FastifyInstance } from "fastify";

export default async function uploadRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const uploadService = new UploadService();
  app.post("/image/:storage", uploadService.uploadImage);
  app.delete("/image/:filename", uploadService.deleteImage);
  done();
}

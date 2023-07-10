import UploadService from "@/services/UploadService";
import { FastifyInstance } from "fastify";

export default async function uploadRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const uploadService = new UploadService();
  app.post("/image/:storage", (req, rep) =>
    uploadService.uploadImage(req, rep)
  );
  app.delete("/image/:filename", (req, rep) =>
    uploadService.deleteImage(req, rep)
  );
  done();
}

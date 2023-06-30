import UploadService from "@/services/UploadService";
import { FastifyInstance } from "fastify";

export default async function uploadRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const uploadService = new UploadService();
  app.post("/category", uploadService.uploadCategoryImage);
  app.delete("/category/:filename", uploadService.deleteCategoryImage);
  app.post("/avatar", uploadService.uploadAvatarImage);
  app.delete("/avatar/:filename", uploadService.deleteAvatarImage);
  done();
}

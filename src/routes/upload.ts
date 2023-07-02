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
  app.post("/project", uploadService.uploadProjectImage);
  app.delete("/project/:filename", uploadService.deleteProjectImage);
  app.post("/service", uploadService.uploadServiceImage);
  app.delete("/service/:filename", uploadService.deleteServiceImage);
  done();
}

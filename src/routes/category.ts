import CategoryService from "@/services/CategoryService";
import { FastifyInstance } from "fastify";

export default async function categoryRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.get("/popular-categories", categoryService.getPopularCategories);
  app.get("/", categoryService.getAllCategories);

  done();
}

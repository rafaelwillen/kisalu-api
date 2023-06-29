import CategoryService from "@/services/CategoryService";
import { FastifyInstance } from "fastify";

export default async function publicRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.get("/popular-categories", categoryService.getPopularCategories);

  done();
}

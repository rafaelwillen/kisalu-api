import { CategoryService } from "@/services";
import { FastifyInstance } from "fastify";

export default function adminCategoriesRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.post("/", categoryService.createCategory);
  done();
}

import { CategoryService } from "@/services";
import { FastifyInstance } from "fastify";

export default function adminCategoriesRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.post("/", categoryService.createCategory);
  app.get("/", categoryService.getAllCategories);
  app.get("/:id", categoryService.getCategoryById);
  app.get("/slug/:slug", categoryService.getCategoryBySlug);
  app.delete("/:id", categoryService.deleteCategory);
  done();
}

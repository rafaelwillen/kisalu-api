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
  app.delete("/:id", categoryService.deleteCategory);
  done();
}

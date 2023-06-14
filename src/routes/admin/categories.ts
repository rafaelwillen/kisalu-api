import { CategoryService } from "@/services";
import { FastifyInstance } from "fastify";

export default function adminCategoriesRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.post("/", categoryService.createCategory);
  app.get("/", categoryService.getAllCategoriesAdminOnly);
  app.get("/:id", categoryService.getCategoryByID);
  app.delete("/:id", categoryService.deleteCategory);
  app.put("/:id", categoryService.updateCategory);
  done();
}

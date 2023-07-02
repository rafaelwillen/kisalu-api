import useEnsureAdminIsAuthenticated from "@/hooks/useEnsureAdminIsAuthenticated";
import CategoryService from "@/services/CategoryService";
import { FastifyInstance } from "fastify";

export default function adminCategoriesRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.addHook("onRequest", useEnsureAdminIsAuthenticated);

  app.post("/", (req, rep) => categoryService.createCategory(req, rep));
  app.get("/", (req, rep) =>
    categoryService.getAllCategoriesAdminOnly(req, rep)
  );
  app.get("/:id", (req, rep) => categoryService.getCategoryByID(req, rep));
  app.delete("/:id", (req, rep) => categoryService.deleteCategory(req, rep));
  app.put("/:id", (req, rep) => categoryService.updateCategory(req, rep));
  done();
}

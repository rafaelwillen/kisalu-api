import CategoryService from "@/services/CategoryService";
import { FastifyInstance } from "fastify";

export default async function categoryRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const categoryService = new CategoryService();

  app.get("/popular-categories", (req, rep) =>
    categoryService.getPopularCategories(req, rep)
  );
  app.get("/", (req, rep) => categoryService.getAllCategories(req, rep));
  app.get("/query", (req, rep) =>
    categoryService.queryCategoriesByName(req, rep)
  );
  app.get("/:id/projects", (req, rep) =>
    categoryService.getProjectsByCategory(req, rep)
  );
  app.get("/:id/services", (req, rep) =>
    categoryService.getServicesByCategory(req, rep)
  );
  done();
}

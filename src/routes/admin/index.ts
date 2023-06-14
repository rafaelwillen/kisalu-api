import AdministratorService from "@/services/AdministratorService";
import { FastifyInstance } from "fastify";
import adminCategoriesRoutes from "./categories";

export default function adminRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  // TODO: Add route protection here
  // app.addHook("onRequest", useEnsureAdminIsAuthenticated);

  const adminService = new AdministratorService();

  app.post("/", adminService.createAdministrator);
  app.get("/", adminService.getAllAdministrators);

  // Categories routes
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

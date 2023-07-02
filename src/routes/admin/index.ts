import useEnsureAdminIsAuthenticated from "@/hooks/useEnsureAdminIsAuthenticated";
import AdministratorService from "@/services/AdministratorService";
import { FastifyInstance } from "fastify";
import adminCategoriesRoutes from "./categories";

export default function adminRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const adminService = new AdministratorService();

  app.post("/", (req, rep) => adminService.createAdministrator(req, rep));
  app.register(privateRoutes);

  // Categories routes
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

function privateRoutes(app: FastifyInstance, options: any, done: () => void) {
  const adminService = new AdministratorService();

  app.addHook("onRequest", useEnsureAdminIsAuthenticated);

  app.get("/", (req, rep) => adminService.getAllAdministrators(req, rep));
  app.get("/:id", (req, rep) => adminService.getSingleAdministrator(req, rep));
  app.delete("/", (req, rep) => adminService.deleteAdmin(req, rep));
  app.put("/:id", (req, rep) => adminService.updateAdministrator(req, rep));
  done();
}
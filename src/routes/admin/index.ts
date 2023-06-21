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

  app.post("/", adminService.createAdministrator);
  app.get(
    "/",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    adminService.getAllAdministrators
  );
  app.get(
    "/:id",
    { onRequest: [useEnsureAdminIsAuthenticated] },
    adminService.getSingleAdministrator
  );
  app.delete(
    "/",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    adminService.deleteAdmin
  );

  // Categories routes
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

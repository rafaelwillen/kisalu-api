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
  app.get(
    "/",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    (req, rep) => adminService.getAllAdministrators(req, rep)
  );
  app.get("/:id", { onRequest: [useEnsureAdminIsAuthenticated] }, (req, rep) =>
    adminService.getSingleAdministrator(req, rep)
  );
  app.delete(
    "/",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    (req, rep) => adminService.deleteAdmin(req, rep)
  );
  app.put(
    "/:id",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    (req, rep) => adminService.updateAdministrator(req, rep)
  );

  // Categories routes
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

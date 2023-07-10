import useEnsureAdminIsAuthenticated from "@/hooks/useEnsureAdminIsAuthenticated";
import AuthenticationService from "@/services/AuthenticationService";
import { FastifyInstance } from "fastify";

export default async function authenticationRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const authenticationService = new AuthenticationService();

  app.get("/me", (req, rep) =>
    authenticationService.getCurrentAuthenticatedUser(req, rep)
  );
  app.post("/login/admin", (req, rep) =>
    authenticationService.authenticateAdministrator(req, rep)
  );
  app.post("/login", (req, rep) =>
    authenticationService.authenticateUser(req, rep)
  );
  app.put(
    "/password-reset/admin",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    (req, rep) => authenticationService.resetAdministratorPassword(req, rep)
  );
  done();
}

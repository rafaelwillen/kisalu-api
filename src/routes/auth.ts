import useEnsureAdminIsAuthenticated from "@/hooks/useEnsureAdminIsAuthenticated";
import AuthenticationService from "@/services/AuthenticationService";
import { FastifyInstance } from "fastify";

export default async function authenticationRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const authenticationService = new AuthenticationService();

  app.get("/me", authenticationService.getCurrentAuthenticatedUser);
  app.post("/login/admin", authenticationService.authenticateAdministrator);
  app.post("/login", authenticationService.authenticateUser);
  app.put(
    "/password-reset/admin",
    {
      onRequest: [useEnsureAdminIsAuthenticated],
    },
    authenticationService.resetAdministratorPassword
  );
  done();
}

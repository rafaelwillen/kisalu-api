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

  done();
}

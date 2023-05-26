import { AuthenticationService } from "@/services";
import { FastifyInstance } from "fastify";

export default async function authenticationRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const authenticationService = new AuthenticationService();

  app.get("/me", authenticationService.getCurrentUser);
  app.post("/login/admin", authenticationService.adminLogin);
  app.post("/login/admin/verify", authenticationService.verifyAdminToken);

  done();
}

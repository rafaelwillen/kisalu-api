import { AuthenticationService } from "@/services";
import { FastifyInstance } from "fastify";
import adminCategoriesRoutes from "./categories";

export default function adminRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const authenticationService = new AuthenticationService();

  app.post("/login", authenticationService.adminLogin);
  // Categories
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

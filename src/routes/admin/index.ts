import { FastifyInstance } from "fastify";
import adminCategoriesRoutes from "./categories";

export default function adminRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  // TODO: Add route protection here

  // Categories routes
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

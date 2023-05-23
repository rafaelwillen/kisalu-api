import { FastifyInstance } from "fastify";
import adminCategoriesRoutes from "./categories";

export default function adminRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  // Categories
  app.register(adminCategoriesRoutes, { prefix: "/category" });
  done();
}

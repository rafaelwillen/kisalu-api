import { FastifyInstance } from "fastify";
import adminCategoriesRoutes from "./categories";

export default function adminRoutes(app: FastifyInstance) {
  // Categories
  app.register(adminCategoriesRoutes, { prefix: "/categories" });
}

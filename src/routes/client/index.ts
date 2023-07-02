import { ClientService } from "@/services/ClientService";
import { FastifyInstance } from "fastify";
import projectsRoutes from "./project";

export default function clientRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const clientService = new ClientService();
  app.post("/", clientService.createClient);
  app.register(projectsRoutes, { prefix: "/projects" });
  done();
}

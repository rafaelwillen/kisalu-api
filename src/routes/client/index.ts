import { ClientService } from "@/services/ClientService";
import { FastifyInstance } from "fastify";
import projectsRoutes from "./project";

export default function clientRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const clientService = new ClientService();
  app.post("/", (req, rep) => clientService.createClient(req, rep));
  app.register(projectsRoutes, { prefix: "/projects" });
  done();
}

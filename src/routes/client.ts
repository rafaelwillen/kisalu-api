import { ClientService } from "@/services/ClientService";
import { FastifyInstance } from "fastify";

export function clientRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const clientService = new ClientService();
  app.post("/", clientService.createClient);
  done();
}

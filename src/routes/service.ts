import ServiceService from "@/services/ServiceService";
import { FastifyInstance } from "fastify";

export default async function servicesRoutes(
  app: FastifyInstance,
  options: any,
  done: () => void
) {
  const serviceService = new ServiceService();

  app.get("/:id", (req, res) => serviceService.getServiceById(req, res));

  done();
}

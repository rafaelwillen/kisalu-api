import useUserIsProvider from "@/hooks/useUserIsProvider";
import ServiceService from "@/services/ServiceService";
import { FastifyInstance } from "fastify";

export default function servicesRoutes(
  app: FastifyInstance,
  options: unknown,
  done: () => void
) {
  const serviceService = new ServiceService();
  app.addHook("onRequest", useUserIsProvider);

  app.post("/", serviceService.createService);
  app.get("/", serviceService.getAllFromProvider);
  app.get("/:id", serviceService.getSingleServiceFromProvider);
  app.delete("/:id", serviceService.deleteService);
  done();
}

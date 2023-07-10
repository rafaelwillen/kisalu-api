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

  app.post("/", (req, rep) => serviceService.createService(req, rep));
  app.get("/", (req, rep) => serviceService.getAllFromProvider(req, rep));
  app.get("/:id", (req, rep) =>
    serviceService.getSingleServiceFromProvider(req, rep)
  );
  app.delete("/:id", (req, rep) => serviceService.deleteService(req, rep));
  done();
}

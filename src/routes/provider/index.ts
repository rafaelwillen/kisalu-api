import { ProviderService } from "@/services/ProviderService";
import { FastifyInstance } from "fastify";
import servicesRoutes from "./service";

export default function providerRoutes(
  app: FastifyInstance,
  option: unknown,
  done: () => void
) {
  const providerService = new ProviderService();

  app.post("/", (req, rep) => providerService.createProvider(req, rep));
  app.register(servicesRoutes, { prefix: "/services" });
  done();
}

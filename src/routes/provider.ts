import { ProviderService } from "@/services/ProviderService";
import { FastifyInstance } from "fastify";

export default function providerRoutes(
  app: FastifyInstance,
  option: unknown,
  done: () => void
) {
  const providerService = new ProviderService();

  app.post("/", providerService.createProvider);

  done();
}

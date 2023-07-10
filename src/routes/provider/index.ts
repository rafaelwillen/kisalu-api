import useUserIsProvider from "@/hooks/useUserIsProvider";
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
  app.put("/avatar", { onRequest: useUserIsProvider }, (req, rep) =>
    providerService.updateProviderAvatarImage(req, rep)
  );
  app.delete("/avatar", { onRequest: useUserIsProvider }, (req, rep) =>
    providerService.resetProviderAvatarImage(req, rep)
  );
  app.register(servicesRoutes, { prefix: "/services" });
  done();
}

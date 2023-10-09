import useUserIsProvider from "@/hooks/useUserIsProvider";
import { ProviderService } from "@/services/ProviderService";
import { FastifyInstance } from "fastify";
import experienceInfoRoutes from "./experienceInfo";
import servicesRoutes from "./service";

export default function providerRoutes(
  app: FastifyInstance,
  option: unknown,
  done: () => void
) {
  const providerService = new ProviderService();

  app.post("/", (req, rep) => providerService.createProvider(req, rep));
  app.put("/avatar", { onRequest: useUserIsProvider }, (req, rep) =>
    providerService.updateUserAvatarImage(req, rep)
  );
  app.put("/address", { onRequest: useUserIsProvider }, (req, rep) =>
    providerService.updateUserAddress(req, rep)
  );
  app.get("/:id/rating", (req, res) =>
    providerService.getProviderRatings(req, res)
  );

  app.register(experienceInfoRoutes, { prefix: "/experience" });
  app.register(servicesRoutes, { prefix: "/services" });
  done();
}

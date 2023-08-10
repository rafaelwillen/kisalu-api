import useUserIsProvider from "@/hooks/useUserIsProvider";
import ExperienceInfoService from "@/services/ExperienceInfoService";
import { FastifyInstance } from "fastify";

export default function experienceInfoRoutes(
  app: FastifyInstance,
  option: unknown,
  done: () => void
) {
  const experienceInfoService = new ExperienceInfoService();
  app.addHook("onRequest", useUserIsProvider);

  app.post("/", (req, rep) =>
    experienceInfoService.createExperienceInfo(req, rep)
  );
  app.get("/", (req, rep) =>
    experienceInfoService.getAllExperienceInfos(req, rep)
  );
  app.delete("/:id", (req, rep) =>
    experienceInfoService.deleteExperienceInfo(req, rep)
  );
  app.put("/:id", (req, rep) =>
    experienceInfoService.updateExperienceInfo(req, rep)
  );

  done();
}

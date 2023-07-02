import useUserIsClient from "@/hooks/useUserIsClient";
import ProjectService from "@/services/ProjectService";
import { FastifyInstance } from "fastify";

export default function projectsRoutes(
  app: FastifyInstance,
  options: unknown,
  done: () => void
) {
  const projectService = new ProjectService();
  app.addHook("onRequest", useUserIsClient);

  app.post("/", projectService.createProject);
  app.put("/:id/available", projectService.changeProjectState);
  app.get("/", projectService.getAllFromClient);
  done();
}

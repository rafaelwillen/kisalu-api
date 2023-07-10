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

  app.post("/", (req, rep) => projectService.createProject(req, rep));
  app.put("/:id/available", (request, reply) =>
    projectService.changeProjectState(request, reply)
  );
  app.get("/", (req, rep) => projectService.getAllFromClient(req, rep));
  app.get("/:id", (req, rep) =>
    projectService.getSingleProjectFromClient(req, rep)
  );
  app.delete("/:id", (request, reply) =>
    projectService.deleteProject(request, reply)
  );
  done();
}

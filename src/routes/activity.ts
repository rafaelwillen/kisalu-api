import useEnsureAdminIsAuthenticated from "@/hooks/useEnsureAdminIsAuthenticated";
import useUserIsClient from "@/hooks/useUserIsClient";
import useUserIsClientOrProvider from "@/hooks/useUserIsClientOrProvider";
import ActivityService from "@/services/ActivityService";
import { FastifyInstance } from "fastify";

export default async function activitiesRoutes(
  app: FastifyInstance,
  _: any,
  done: () => void
) {
  const activityService = new ActivityService();

  app.post("/", { onRequest: useUserIsClient }, (req, res) =>
    activityService.create(req, res)
  );
  app.get("/user/:id", (req, res) => activityService.getByUserId(req, res));
  app.get("/service/:id", (req, res) =>
    activityService.getByServiceId(req, res)
  );
  app.get("/:id", (req, res) => activityService.getById(req, res));
  app.get("/", (req, res) => activityService.getAll(req, res));
  app.put("/state/:id", { onRequest: useUserIsClientOrProvider }, (req, res) =>
    activityService.changeState(req, res)
  );
  app.delete("/:id", { onRequest: useEnsureAdminIsAuthenticated }, (req, res) =>
    activityService.delete(req, res)
  );
  done();
}

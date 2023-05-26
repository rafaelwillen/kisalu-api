import { verifyJWT } from "@/configs/jwt";
import { FastifyHookFunction } from "@/utils/types";

const useEnsureAdminIsAuthenticated: FastifyHookFunction = async (
  request,
  reply
) => {
  try {
    const payload = await verifyJWT(request);
    if (payload.role !== "admin") throw new Error("Unauthorized");
  } catch (error) {
    reply.status(401).send({ message: "Unauthorized" });
  }
};

export default useEnsureAdminIsAuthenticated;

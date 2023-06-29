import { verifyJWT } from "@/configs/jwt";
import { FastifyHookFunction } from "@/utils/types";

const useEnsureUserIsAuthenticated: FastifyHookFunction = async (
  request,
  reply
) => {
  const payload = await verifyJWT(request);
  if (payload.role === "Administrator")
    return reply.status(401).send({ message: "Unauthorized" });
};

export default useEnsureUserIsAuthenticated;

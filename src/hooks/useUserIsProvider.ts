import { verifyJWT } from "@/configs/jwt";
import { FastifyHookFunction } from "@/utils/types";

const useUserIsProvider: FastifyHookFunction = async (request, reply) => {
  const payload = await verifyJWT(request);
  if (payload.role === "Administrator")
    return reply.status(401).send({ message: "Unauthorized" });
  if (payload.role !== "Provider")
    return reply.status(401).send({ message: "Unauthorized" });
};

export default useUserIsProvider;

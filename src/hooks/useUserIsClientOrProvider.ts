import { verifyJWT } from "@/configs/jwt";
import { HTTP_STATUS_CODE } from "@/constants";
import { FastifyHookFunction } from "@/utils/types";

const useUserIsClientOrProvider: FastifyHookFunction = async (
  request,
  reply
) => {
  const payload = await verifyJWT(request);
  if (payload.role === "Administrator")
    return reply
      .status(HTTP_STATUS_CODE.UNAUTHORIZED)
      .send({ message: "Unauthorized" });
};

export default useUserIsClientOrProvider;

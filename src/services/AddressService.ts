import { HTTP_STATUS_CODE } from "@/constants";
import {
  getAllCountiesFromProvince,
  getAllProvinces,
} from "@/utils/angolaSubdivisions";
import HTTPError from "@/utils/error/HTTPError";
import { noSymbolRegex } from "@/utils/regex";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class AddressService {
  async getAllProvinces(request: FastifyRequest, reply: FastifyReply) {
    const provinces = getAllProvinces();
    return reply.send(provinces);
  }

  async getAllCountiesFromProvince(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { province } = parseProvinceParams(request);
      const counties = getAllCountiesFromProvince(province);
      return reply.send(counties);
    } catch (error) {
      throw new HTTPError(
        HTTP_STATUS_CODE.BAD_REQUEST,
        "Invalid province name"
      );
    }
  }
}

function parseProvinceParams(request: FastifyRequest) {
  const schema = z.object({
    province: z.string().min(3).regex(noSymbolRegex, "Invalid province name"),
  });
  return schema.parse(request.params);
}

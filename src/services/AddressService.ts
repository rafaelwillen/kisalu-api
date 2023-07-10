import { HTTP_STATUS_CODE } from "@/constants";
import AddressParser from "@/parsers/AddressParser";
import {
  getAllCountiesFromProvince,
  getAllProvinces,
} from "@/utils/angolaSubdivisions";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";

export class AddressService {
  private readonly parser = new AddressParser();

  async getAllProvinces(request: FastifyRequest, reply: FastifyReply) {
    const provinces = getAllProvinces();
    return reply.send(provinces);
  }

  async getAllCountiesFromProvince(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { province } = this.parser.parseProvinceFromParams(request);
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


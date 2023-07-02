import { noSymbolRegex } from "@/utils/regex";
import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class AddressParser extends BaseParser {
  parseProvinceFromParams(request: FastifyRequest) {
    const schema = z.object({
      province: z.string().min(3).regex(noSymbolRegex, "Invalid province name"),
    });
    return schema.parse(request.params);
  }
}

import { ADULT_DATE_OF_BIRTH } from "@/constants";
import {
  getAllCountiesFromProvince,
  getAllProvinces,
} from "@/utils/angolaSubdivisions";
import { angolanPhoneNumberRegex, noSymbolRegex } from "@/utils/regex";
import { isBefore } from "date-fns";
import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class UserParser extends BaseParser {
  parseBodyForUserCreation(request: FastifyRequest) {
    const schema = z
      .object({
        firstName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
        lastName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
        avatarImageURL: z.string().url(),
        gender: z.enum(["Male", "Female"]),
        email: z.string().email(),
        password: z.string().min(8).max(20),
        phoneNumber: z
          .string()
          .regex(angolanPhoneNumberRegex, "Invalid phone number"),
        biography: z.string().min(10).max(500).optional(),
        birthDate: z.string().datetime(),
      })
      .transform(({ birthDate, ...data }) => ({
        ...data,
        birthDate: new Date(birthDate),
      }))
      .refine(({ birthDate }) => isBefore(birthDate, ADULT_DATE_OF_BIRTH), {
        message: "You must be at least 18 years old",
        path: ["birthDate"],
      })
      .refine(({ birthDate }) => isBefore(birthDate, new Date()), {
        message: "You can't be born in the future",
        path: ["birthDate"],
      });
    return schema.parse(request.body);
  }

  parseBodyForImageUpdate(request: FastifyRequest) {
    const schema = z.object({
      url: z.string().url(),
    });
    return schema.parse(request.body);
  }

  parseBodyForAddressUpdate(request: FastifyRequest) {
    const schema = z
      .object({
        addressLine: z.string().nonempty(),
        province: z
          .string()
          .nonempty()
          .refine((province) => getAllProvinces().includes(province)),
        county: z.string().nonempty(),
      })
      .refine(({ province, county }) =>
        getAllCountiesFromProvince(province).includes(county)
      );
    return schema.parse(request.body);
  }
}

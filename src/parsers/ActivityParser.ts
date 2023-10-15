import { isAfter } from "date-fns";
import { FastifyRequest } from "fastify";
import { isEqual } from "underscore";
import z from "zod";
import BaseParser from "./BaseParser";

export default class ActivityParser extends BaseParser {
  parseBodyForStateChange(request: FastifyRequest) {
    const bodySchema = z.object({
      state: z.enum(["Active", "OnDispute", "Finished", "Cancelled"]),
    });
    return bodySchema.parse(request.body);
  }
  parseBodyForCreation(request: FastifyRequest) {
    const bodySchema = z
      .object({
        agreedValue: z.number().int().min(0),
        startDate: z
          .string()
          .datetime()
          .transform((value) => new Date(value)),
        serviceId: z.string().uuid(),
        activityDetails: z.string().min(3),
        address: z.object({
          county: z.string().min(3),
          addressLine: z.string().min(3),
          province: z.string().min(3),
        }),
      })
      .refine(
        ({ startDate }) =>
          isAfter(startDate, new Date()) || !isEqual(startDate, new Date()),
        {
          path: ["startDate"],
          message: "Start date cannot be before today",
        }
      );
    return bodySchema.parse(request.body);
  }
}

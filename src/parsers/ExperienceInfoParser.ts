import { isBefore } from "date-fns";
import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class ExperienceInfoParser extends BaseParser {
  parseBodyForCreation(request: FastifyRequest) {
    const schema = z
      .object({
        title: z.string().min(3),
        institutionName: z.string().min(3),
        startDate: z
          .string()
          .datetime()
          .transform((value) => new Date(value)),
        endDate: z
          .string()
          .datetime()
          .transform((value) => new Date(value))
          .or(z.undefined().transform(() => null)),
        description: z.string().min(3),
        type: z.enum(["Work", "Education"]),
      })
      .refine(
        ({ endDate }) => {
          if (!endDate) return true;
          return isBefore(endDate, new Date());
        },
        { path: ["endDate"], message: "End date cannot be before today" }
      )
      .refine(
        ({ startDate, endDate }) => {
          if (!endDate) return true;
          return isBefore(startDate, endDate);
        },
        { path: ["endDate"], message: "End date cannot be before start date" }
      );
    return schema.parse(request.body);
  }

  parseBodyForUpdate(request: FastifyRequest) {
    const schema = z
      .object({
        title: z.string().min(3),
        institutionName: z.string().min(3),
        startDate: z.date().max(new Date(), "Date cannot be after today"),
        endDate: z
          .string()
          .datetime()
          .transform((value) => new Date(value))
          .or(z.null()),
        description: z.string().min(3),
      })
      .refine(
        ({ endDate }) => {
          if (!endDate) return true;
          return isBefore(endDate, new Date());
        },
        { path: ["endDate"], message: "End date cannot be before today" }
      )
      .refine(
        ({ startDate, endDate }) => {
          if (!endDate) return true;
          return isBefore(startDate, endDate);
        },
        { path: ["endDate"], message: "End date cannot be before start date" }
      );
    return schema.parse(request.body);
  }
}

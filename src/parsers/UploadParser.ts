import { firebaseStorageAcceptableParams } from "@/configs/firebase";
import { FastifyRequest } from "fastify";
import z from "zod";
import BaseParser from "./BaseParser";

export default class UploadParser extends BaseParser {
  parseFilenameParams(request: FastifyRequest) {
    const schema = z
      .object({
        filename: z.string(),
      })
      .refine(
        ({ filename }) =>
          firebaseStorageAcceptableParams.includes(
            filename.split("_")[1].split(".")[0]
          ),
        {
          message: "Invalid filename parameter",
          path: ["filename"],
        }
      );
    return schema.parse(request.params);
  }

  parseStorageLocationFromParams(request: FastifyRequest) {
    const schema = z
      .object({
        storage: z.string(),
      })
      .refine(
        ({ storage }) => firebaseStorageAcceptableParams.includes(storage),
        {
          message: "Invalid storage parameter",
          path: ["storage"],
        }
      );
    return schema.parse(request.params);
  }
}

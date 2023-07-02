import { firebaseStorageAcceptableParams, storage } from "@/configs/firebase";
import { HTTP_STATUS_CODE } from "@/constants";
import HTTPError from "@/utils/error/HTTPError";
import { imageMimetypeRegex } from "@/utils/regex";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import z from "zod";
import { handleUploadError } from ".";

export default class UploadService {
  async uploadImage(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    try {
      const { storage } = parseFileUploadParams(request);
      if (!data)
        throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "No File received");
      const isValidMimetype = imageMimetypeRegex.test(data.mimetype);
      if (!isValidMimetype)
        throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "Invalid file type");
      const extension = extname(data.filename);
      const fileName = randomUUID().concat(`_${storage}${extension}`);
      const url = await upload(
        `images/${storage}/${fileName}`,
        data.mimetype,
        await data.toBuffer()
      );
      reply.code(HTTP_STATUS_CODE.CREATED).send({
        url,
      });
    } catch (error) {
      handleUploadError(error, reply);
    }
  }

  async deleteImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { filename } = parseFilenameParams(request);
      const firebaseStoragePath = filename.split("_")[1].split(".")[0];
      const ref = `images/${firebaseStoragePath}/${filename}`;
      await deleteFile(ref);
      reply.send();
    } catch (error) {
      handleUploadError(error, reply);
    }
  }
}

function parseFilenameParams(request: FastifyRequest) {
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

function parseFileUploadParams(request: FastifyRequest) {
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

async function upload(path: string, contentType: string, data: Buffer) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, data, {
    contentType,
  });
  const url = await getDownloadURL(fileRef);
  return url;
}

async function deleteFile(path: string) {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

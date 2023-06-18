import { storage } from "@/configs/firebase";
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
  async uploadCategoryImage(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data)
      throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "No File received");
    const isValidMimetype = imageMimetypeRegex.test(data.mimetype);
    if (!isValidMimetype)
      throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "Invalid file type");
    const extension = extname(data.filename);
    const fileName = randomUUID().concat("_category").concat(extension);
    try {
      const url = await upload(
        `images/category/${fileName}`,
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

  async deleteCategoryImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { objectURL } = parseObjectURL(request);
      const decodedPath = decodeObjectURL(objectURL);
      const fileName = decodedPath.split("/").pop();
      if (!fileName?.includes("_category"))
        throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "Invalid file type");
      const ref = `images/category/${fileName}`;
      await deleteFile(ref);
      reply.send();
    } catch (error) {
      handleUploadError(error, reply);
    }
  }
}

function parseObjectURL(request: FastifyRequest) {
  try {
    const schema = z.object({
      objectURL: z.string().url(),
    });
    return schema.parse(request.body);
  } catch (error) {
    throw new HTTPError(
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid body",
      error as Error
    );
  }
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

function decodeObjectURL(objectURL: string) {
  const path = new URL(objectURL).pathname;
  const decodedPath = decodeURIComponent(path);
  return decodedPath;
}
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
      const { filename } = parseFilenameParams(request, "_category");
      const ref = `images/category/${filename}`;
      await deleteFile(ref);
      reply.send();
    } catch (error) {
      handleUploadError(error, reply);
    }
  }

  async uploadAvatarImage(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data)
      throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "No File received");
    const isValidMimetype = imageMimetypeRegex.test(data.mimetype);
    if (!isValidMimetype)
      throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "Invalid file type");
    const extension = extname(data.filename);
    const fileName = randomUUID().concat("_avatar").concat(extension);
    try {
      const url = await upload(
        `images/avatar/${fileName}`,
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

  async deleteAvatarImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { filename } = parseFilenameParams(request, "_avatar");
      const ref = `images/avatar/${filename}`;
      await deleteFile(ref);
      reply.send();
    } catch (error) {
      handleUploadError(error, reply);
    }
  }

  async uploadProjectImage(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data)
      throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "No File received");
    const isValidMimetype = imageMimetypeRegex.test(data.mimetype);
    if (!isValidMimetype)
      throw new HTTPError(HTTP_STATUS_CODE.BAD_REQUEST, "Invalid file type");
    const extension = extname(data.filename);
    const fileName = randomUUID().concat("_project").concat(extension);
    try {
      const url = await upload(
        `images/project/${fileName}`,
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

  async deleteProjectImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { filename } = parseFilenameParams(request, "_project");
      const ref = `images/project/${filename}`;
      await deleteFile(ref);
      reply.send();
    } catch (error) {
      handleUploadError(error, reply);
    }
  }
}

function parseFilenameParams(request: FastifyRequest, includesString: string) {
  const schema = z.object({
    filename: z.string().includes(includesString, {
      message: "Invalid filename",
    }),
  });
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

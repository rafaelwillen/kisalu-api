import { storage } from "@/configs/firebase";
import { HTTP_STATUS_CODE } from "@/constants";
import UploadParser from "@/parsers/UploadParser";
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
import { handleUploadError } from ".";

export default class UploadService {
  private readonly parser = new UploadParser();

  async uploadImage(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    try {
      const { storage } = this.parser.parseStorageLocationFromParams(request);
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
      const { filename } = this.parser.parseFilenameParams(request);
      const firebaseStoragePath = filename.split("_")[1].split(".")[0];
      const ref = `images/${firebaseStoragePath}/${filename}`;
      await deleteFile(ref);
      reply.send();
    } catch (error) {
      handleUploadError(error, reply);
    }
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

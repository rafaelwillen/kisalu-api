import { storage } from "@/configs/firebase";
import { imageMimetypeRegex } from "@/utils/regex";
import { RequestFileTooLargeError } from "@fastify/multipart";
import { FastifyReply, FastifyRequest } from "fastify";
import { FirebaseError } from "firebase/app";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

export default class UploadService {
  async uploadCategoryBanner(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ message: "No file received" });
    }
    const isValidMimetype = imageMimetypeRegex.test(data.mimetype);
    if (!isValidMimetype)
      return reply.code(400).send({ message: "Invalid file type" });
    const extension = extname(data.filename);
    const fileName = randomUUID().concat("_category").concat(extension);
    try {
      const url = await upload(
        `images/category/${fileName}`,
        data.mimetype,
        await data.toBuffer()
      );
      reply.code(201).send({
        url,
      });
    } catch (error) {
      console.log(error);
      if (error as RequestFileTooLargeError)
        reply.code(413).send({ message: "File too large" });
      if (error instanceof FirebaseError) {
        reply.code(500).send({ message: error.message, code: error.code });
      } else reply.code(500).send({ message: "Internal server error" });
    }
  }
}

async function upload(path: string, contentType: string, data: Buffer) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, await data, {
    contentType,
  });
  const url = await getDownloadURL(fileRef);
  return url;
}

import { HTTP_STATUS_CODE } from "@/constants";
import HTTPError from "@/utils/error/HTTPError";
import fastifyJWT from "@fastify/jwt";
import { Role } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export default async function configJWT(app: FastifyInstance) {
  app.register(fastifyJWT, {
    secret: process.env.JWT_SECRET_KEY,
  });
}

export async function verifyJWT(
  request: FastifyRequest
): Promise<AuthenticatedUser> {
  try {
    const payload = await request.jwtVerify();
    const parsedPayload = parseJWTPayloadType(payload);
    return parsedPayload;
  } catch (error) {
    throw new HTTPError(HTTP_STATUS_CODE.UNAUTHORIZED, "Invalid Token");
  }
}

function parseJWTPayloadType(payload: any) {
  const schema = z.object({
    email: z.string().nonempty().email(),
    role: z.enum(["Administrator", "Provider", "Client"]),
  });

  return schema.parse(payload);
}

export async function signJWT(reply: FastifyReply, payload: AuthenticatedUser) {
  return await reply.jwtSign(payload, {
    sign: {
      expiresIn: "1d",
    },
  });
}

export type AuthenticatedUser = {
  email: string;
  role: Role;
};

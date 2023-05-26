import fastifyJWT from "@fastify/jwt";
import { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";

export default async function configJWT(app: FastifyInstance) {
  app.register(fastifyJWT, {
    secret: process.env.JWT_SECRET_KEY,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });
}

export async function verifyJWT(
  request: FastifyRequest
): Promise<AuthenticatedUser> {
  const payload = await request.jwtVerify();
  const parsedPayload = parseJWTPayloadType(payload);
  return parsedPayload;
}

function parseJWTPayloadType(payload: any) {
  const schema = z.object({
    username: z.string().nonempty(),
    email: z.string().nonempty().email(),
    role: z.enum(["admin", "user"]),
    exp: z.number().int().positive(),
    iat: z.number().int().positive(),
  });
  return schema.parse(payload);
}

export type AuthenticatedUser = {
  username: string;
  email: string;
  role: "admin" | "user";
};
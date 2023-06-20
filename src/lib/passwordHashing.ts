import HTTPError from "@/utils/error/HTTPError";
import { compare, hash } from "bcrypt";
const saltRounds = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    return await hash(plainPassword, saltRounds);
  } catch (error) {
    throw new HTTPError(500, "Internal server error", error as Error);
  }
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new HTTPError(500, "Internal server error", error as Error);
  }
}

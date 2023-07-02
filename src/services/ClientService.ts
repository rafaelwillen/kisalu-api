import { ADULT_DATE_OF_BIRTH, HTTP_STATUS_CODE } from "@/constants";
import { hashPassword } from "@/lib/passwordHashing";
import UserRepository from "@/repository/UserRepository";
import HTTPError from "@/utils/error/HTTPError";
import { angolanPhoneNumberRegex, noSymbolRegex } from "@/utils/regex";
import { isBefore } from "date-fns";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { handleServiceError } from ".";

export class ClientService {
  private clientRepository: UserRepository | undefined;

  async createClient(request: FastifyRequest, reply: FastifyReply) {
    this.clientRepository = new UserRepository();
    try {
      const { password, email, phoneNumber, ...userData } =
        parseClientBody(request);
      const userWithEmail = await this.clientRepository.getByEmail(email);
      if (userWithEmail)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An user with this email already exists"
        );
      const userWithPhoneNumber = await this.clientRepository.getByPhoneNumber(
        phoneNumber
      );
      if (userWithPhoneNumber)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An user with this phone number already exists"
        );
      const hashedPassword = await hashPassword(password);
      const createdClient = await this.clientRepository.createClient({
        auth: {
          email,
          password: hashedPassword,
          phoneNumber,
        },
        ...userData,
      });
      const { loginId, ...created } = createdClient;
      this.clientRepository.close();
      reply.code(HTTP_STATUS_CODE.CREATED).send(created);
    } catch (error) {
      handleServiceError(error, [this.clientRepository], reply);
    }
  }
}

function parseClientBody(request: FastifyRequest) {
  const schema = z
    .object({
      firstName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
      lastName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
      avatarImageURL: z.string().url(),
      gender: z.enum(["Male", "Female"]),
      email: z.string().email(),
      password: z.string().min(8).max(20),
      phoneNumber: z
        .string()
        .regex(angolanPhoneNumberRegex, "Invalid phone number"),
      biography: z.string().min(10).max(500).optional(),
      birthDate: z.string().datetime(),
    })
    .transform(({ birthDate, ...data }) => ({
      ...data,
      birthDate: new Date(birthDate),
    }))
    .refine(({ birthDate }) => isBefore(birthDate, ADULT_DATE_OF_BIRTH), {
      message: "You must be at least 18 years old",
      path: ["birthDate"],
    })
    .refine(({ birthDate }) => isBefore(birthDate, new Date()), {
      message: "You can't be born in the future",
      path: ["birthDate"],
    });
  return schema.parse(request.body);
}

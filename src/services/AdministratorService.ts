import { HTTP_STATUS_CODE } from "@/constants";
import { AdministratorRepository } from "@/repository";
import { CompleteAdministratorType } from "@/repository/AdministratorRepository";
import { noSymbolRegex } from "@/utils/regex";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import z from "zod";
import { handleServiceError } from ".";

export default class AdministratorService {
  private administratorRepository: AdministratorRepository | undefined;

  async createAdministrator(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const parsedAdminBody = parseAdminCreationBody(request);
      const { password, email, ...userData } = parsedAdminBody;
      const createdAdmin = await this.administratorRepository.create({
        auth: { password, email },
        ...userData,
      });
      this.administratorRepository.close();
      reply.code(HTTP_STATUS_CODE.CREATED).send(createdAdmin);
    } catch (error) {
      handleServiceError(error, [this.administratorRepository], reply);
    }
  }

  async getAllAdministrators(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const administrators = await this.administratorRepository.getAll();
      this.administratorRepository.close();
      const safeAdministrators = cleanGetAllAdministratorsReply(administrators);
      return reply.code(HTTP_STATUS_CODE.OK).send(safeAdministrators);
    } catch (error) {
      handleServiceError(error, [this.administratorRepository], reply);
    }
  }
}

function parseAdminCreationBody(request: FastifyRequest) {
  const schema = z.object({
    firstName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
    lastName: z.string().min(3).regex(noSymbolRegex, "No symbols allowed"),
    avatarImageURL: z.string().url(),
    gender: z.enum(["Male", "Female"]),
    email: z.string().email(),
    password: z.string().min(8).max(20),
  });
  return schema.parse(request.body);
}

function cleanGetAllAdministratorsReply(
  administrators: CompleteAdministratorType[]
) {
  return administrators.map((administrator) => {
    const parsedData = {
      ...omit(administrator, "biography", "birthDate", "loginId"),
      auth: omit(
        administrator.auth,
        "id",
        "phoneNumber",
        "isActive",
        "password"
      ),
      disputes: administrator.disputes,
      createdCategories: administrator.createdCategories.map((category) =>
        omit(category, "creatorAdminId")
      ),
    };
    return parsedData;
  });
}
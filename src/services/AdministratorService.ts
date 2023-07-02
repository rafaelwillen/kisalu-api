import { HTTP_STATUS_CODE } from "@/constants";
import { hashPassword } from "@/lib/passwordHashing";
import AdministratorParser from "@/parsers/AdministratoParser";
import { AdministratorRepository } from "@/repository";
import { CompleteAdministratorType } from "@/repository/AdministratorRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class AdministratorService {
  private administratorRepository: AdministratorRepository | undefined;
  private readonly parser = new AdministratorParser();

  async createAdministrator(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const parsedAdminBody = this.parser.parseCreationFromBody(request);
      const { password, email, ...userData } = parsedAdminBody;
      const adminWithEmail = await this.administratorRepository.getByEmail(
        email
      );
      if (adminWithEmail)
        throw new HTTPError(
          HTTP_STATUS_CODE.CONFLICT,
          "An administrator with this email already exists"
        );
      const hashedPassword = await hashPassword(password);
      const createdAdmin = await this.administratorRepository.create({
        auth: { password: hashedPassword, email },
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

  async getSingleAdministrator(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const administrator = await this.administratorRepository.getByID(id);
      this.administratorRepository.close();
      if (!administrator) return reply.code(HTTP_STATUS_CODE.NOT_FOUND).send();
      return reply.send(administrator);
    } catch (error) {
      handleServiceError(error, [this.administratorRepository], reply);
    }
  }

  async deleteAdmin(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    const mainAdminsEmails = [
      "rafaelpadre@gmail.com",
      "rafael.padre@kisalu.com",
    ];
    try {
      const { email } = this.parser.parseDeletionFromBody(request);
      if (
        mainAdminsEmails.includes(email) ||
        !mainAdminsEmails.includes(request.user.email) ||
        request.user.email === email
      )
        throw new HTTPError(
          HTTP_STATUS_CODE.FORBIDDEN,
          "You can't delete this administrator"
        );
      const adminToDelete = await this.administratorRepository.getByEmail(
        email
      );
      if (!adminToDelete)
        throw new HTTPError(
          HTTP_STATUS_CODE.NOT_FOUND,
          "Administrator not found"
        );
      await this.administratorRepository.delete(email);
      this.administratorRepository.close();
      return reply.send();
    } catch (error) {
      handleServiceError(error, [this.administratorRepository], reply);
    }
  }

  async updateAdministrator(request: FastifyRequest, reply: FastifyReply) {
    this.administratorRepository = new AdministratorRepository();
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const parsedAdminBody = this.parser.parseUpdateFromBody(request);
      const adminToUpdate = await this.administratorRepository.getByID(id);
      if (!adminToUpdate)
        throw new HTTPError(
          HTTP_STATUS_CODE.NOT_FOUND,
          "Administrator not found"
        );
      const updatedAdmin = await this.administratorRepository.update(
        id,
        parsedAdminBody
      );
      this.administratorRepository.close();
      return reply.send(updatedAdmin);
    } catch (error) {
      handleServiceError(error, [this.administratorRepository], reply);
    }
  }
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
      createdCategories: administrator.createdCategories
        .map((category) => omit(category, "creatorAdminId"))
        .sort((a, b) => {
          if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          return 0;
        }),
    };
    return parsedData;
  });
}

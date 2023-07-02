import { HTTP_STATUS_CODE } from "@/constants";
import ServiceParser from "@/parsers/ServiceParser";
import { CategoryRepository } from "@/repository";
import ServiceRepository from "@/repository/ServiceRepository";
import UserRepository from "@/repository/UserRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class ServiceService {
  private serviceRepository: ServiceRepository | undefined;
  private providerRepository: UserRepository | undefined;
  private categoryRepository: CategoryRepository | undefined;
  private readonly parser = new ServiceParser();

  async createService(request: FastifyRequest, reply: FastifyReply) {
    this.serviceRepository = new ServiceRepository();
    this.providerRepository = new UserRepository();
    this.categoryRepository = new CategoryRepository();
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      this.providerRepository.close();
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { categoryName, ...parsedService } =
        this.parser.parseBodyForCreation(request);
      const categoryToLink = await this.categoryRepository.getByName(
        categoryName
      );
      this.categoryRepository.close();
      if (!categoryToLink)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      const createdService = await this.serviceRepository.create({
        ...parsedService,
        userId: provider.id,
        categoryId: categoryToLink.id,
        bannerImageURL: parsedService.bannerImageURL || null,
      });
      this.serviceRepository.close();

      return reply
        .code(HTTP_STATUS_CODE.CREATED)
        .send(omit(createdService, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(
        error,
        [
          this.serviceRepository,
          this.providerRepository,
          this.categoryRepository,
        ],
        reply
      );
    }
  }

  async getAllFromProvider(request: FastifyRequest, reply: FastifyReply) {
    this.providerRepository = new UserRepository();
    try {
      const { email } = request.user;
      const userExists = await this.providerRepository.getByEmail(email);
      if (!userExists)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const provider = await this.providerRepository.getProviderById(
        userExists.id
      );
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      this.providerRepository.close();
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(
          provider.createdServices.map((project) =>
            omit(project, "userId", "categoryId")
          )
        );
    } catch (error) {
      handleServiceError(error, [this.providerRepository], reply);
    }
  }

  async getPublicProjectById(request: FastifyRequest, reply: FastifyReply) {
    this.serviceRepository = new ServiceRepository();
    try {
      const { id: serviceId } = this.parser.parseIdFromParams(request);
      const service = await this.serviceRepository.getById(serviceId);
      this.serviceRepository.close();
      if (!service)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      if (service.state === "Draft")
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(service, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, [this.serviceRepository], reply);
    }
  }

  async getSingleServiceFromProvider(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    this.serviceRepository = new ServiceRepository();
    this.providerRepository = new UserRepository();
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      this.providerRepository.close();
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { id: serviceId } = this.parser.parseIdFromParams(request);
      const service = await this.serviceRepository.getByIdFromOwner(
        serviceId,
        provider.id
      );
      this.serviceRepository.close();
      if (!service)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(service, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(
        error,
        [this.serviceRepository, this.providerRepository],
        reply
      );
    }
  }

  async deleteService(request: FastifyRequest, reply: FastifyReply) {
    this.serviceRepository = new ServiceRepository();
    this.providerRepository = new UserRepository();
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      this.providerRepository.close();
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { id: serviceId } = this.parser.parseIdFromParams(request);
      const service = await this.serviceRepository.getByIdFromOwner(
        serviceId,
        provider.id
      );
      if (!service)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      await this.serviceRepository.delete(serviceId);
      this.serviceRepository.close();
      return reply.send();
    } catch (error) {
      handleServiceError(
        error,
        [this.serviceRepository, this.providerRepository],
        reply
      );
    }
  }
}

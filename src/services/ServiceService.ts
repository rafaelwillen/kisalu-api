import { HTTP_STATUS_CODE } from "@/constants";
import ServiceParser from "@/parsers/ServiceParser";
import CategoryRepository from "@/repository/CategoryRepository";
import { ProviderRepository } from "@/repository/ProviderRepository";
import ServiceRepository from "@/repository/ServiceRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class ServiceService {
  private serviceRepository = new ServiceRepository();
  private providerRepository = new ProviderRepository();
  private categoryRepository = new CategoryRepository();
  private readonly parser = new ServiceParser();

  async createService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { categoryName, ...parsedService } =
        this.parser.parseBodyForCreation(request);
      const categoryToLink = await this.categoryRepository.getByName(
        categoryName
      );
      if (!categoryToLink)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      const createdService = await this.serviceRepository.create({
        ...parsedService,
        userId: provider.id,
        categoryId: categoryToLink.id,
        bannerImageURL: parsedService.bannerImageURL || null,
      });

      return reply
        .code(HTTP_STATUS_CODE.CREATED)
        .send(omit(createdService, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getAllFromProvider(request: FastifyRequest, reply: FastifyReply) {
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
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(
          provider.createdServices.map((project) =>
            omit(project, "userId", "categoryId")
          )
        );
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getPublicProjectById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: serviceId } = this.parser.parseIdFromParams(request);
      const service = await this.serviceRepository.getById(serviceId);
      if (!service)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      if (service.state === "Draft")
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(service, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getSingleServiceFromProvider(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { id: serviceId } = this.parser.parseIdFromParams(request);
      const service = await this.serviceRepository.getByIdFromOwner(
        serviceId,
        provider.id
      );
      if (!service)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(service, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async deleteService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
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
      return reply.send();
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}

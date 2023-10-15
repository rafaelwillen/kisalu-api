import { HTTP_STATUS_CODE } from "@/constants";
import ActivityParser from "@/parsers/ActivityParser";
import ActivityRepository from "@/repository/ActivityRepository";
import { ClientRepository } from "@/repository/ClientRepostory";
import ServiceRepository from "@/repository/ServiceRepository";
import UserRepository from "@/repository/UserRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleServiceError } from ".";

export default class ActivityService {
  private activityRepository = new ActivityRepository();
  private clientRepository = new ClientRepository();
  private userRepository = new UserRepository();
  private serviceRepository = new ServiceRepository();
  private readonly parser = new ActivityParser();

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const client = await this.clientRepository.getByEmail(email);
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");

      const { serviceId, activityDetails, address, agreedValue, startDate } =
        this.parser.parseBodyForCreation(request);
      const service = await this.serviceRepository.getById(serviceId);
      if (!service)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Service not found");
      const createdActivity = await this.activityRepository.create({
        clientUserId: client.id,
        activityDetails,
        agreedValue,
        startDate,
        linkedServiceId: serviceId,
        county: address.county,
        addressLine: address.addressLine,
        province: address.province,
        providerUserId: service.userId,
      });

      return reply.code(HTTP_STATUS_CODE.CREATED).send(createdActivity);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const activities = await this.activityRepository.getAll();
      return reply.code(HTTP_STATUS_CODE.OK).send(activities);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const activity = await this.activityRepository.getById(id);
      return reply.code(HTTP_STATUS_CODE.OK).send(activity);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getByUserId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = this.parser.parseIdFromParams(request);
      const activities = await this.activityRepository.getByUserId(userId);
      return reply.code(HTTP_STATUS_CODE.OK).send(activities);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getByServiceId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: serviceId } = this.parser.parseIdFromParams(request);
      const activities = await this.activityRepository.getByServiceId(
        serviceId
      );
      return reply.code(HTTP_STATUS_CODE.OK).send(activities);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const activity = await this.activityRepository.delete(id);
      return reply.code(HTTP_STATUS_CODE.OK).send(activity);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async changeState(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const { id } = this.parser.parseIdFromParams(request);
      const { state } = this.parser.parseBodyForStateChange(request);
      const user = await this.userRepository.getByEmail(email);
      if (!user)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "User not found");
      const activity = await this.activityRepository.setState(id, state);
      return reply.code(HTTP_STATUS_CODE.OK).send(activity);
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}

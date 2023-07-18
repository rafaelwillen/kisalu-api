import { HTTP_STATUS_CODE } from "@/constants";
import ExperienceInfoParser from "@/parsers/ExperienceInfoParser";
import { ExperienceInfoRepository } from "@/repository/ExperienceInfoRepository";
import { ProviderRepository } from "@/repository/ProviderRepository";
import HTTPError from "@/utils/error/HTTPError";
import { ExperienceInfo } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class ExperienceInfoService {
  private experienceInfoRepository = new ExperienceInfoRepository();
  private providerRepository = new ProviderRepository();
  private parser = new ExperienceInfoParser();

  private cleanExperienceInfoResponse(experienceInfo: ExperienceInfo) {
    return omit(experienceInfo, "providerUserId");
  }

  async createExperienceInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const experienceInfoData = this.parser.parseBodyForCreation(request);
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { id: providerId } = provider;
      const experienceInfo = await this.experienceInfoRepository.create(
        experienceInfoData,
        providerId
      );
      reply
        .status(HTTP_STATUS_CODE.CREATED)
        .send(this.cleanExperienceInfoResponse(experienceInfo));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getAllExperienceInfos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { id: providerId } = provider;
      const experienceInfos =
        await this.experienceInfoRepository.getAllFromProvider(providerId);
      reply
        .status(HTTP_STATUS_CODE.OK)
        .send(experienceInfos.map(this.cleanExperienceInfoResponse));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async deleteExperienceInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      if (!provider)
        throw new HTTPError(
          HTTP_STATUS_CODE.UNAUTHORIZED,
          "Provider not found"
        );
      const { id: providerId } = provider;
      const experienceInfo = await this.experienceInfoRepository.getById(id);
      if (!experienceInfo)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Experience not found");
      if (experienceInfo.providerUserId !== providerId)
        throw new HTTPError(
          HTTP_STATUS_CODE.FORBIDDEN,
          "You cannot delete this experience"
        );
      await this.experienceInfoRepository.delete(id);
      reply.send();
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async updateExperienceInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.parser.parseIdFromParams(request);
      const experienceInfoData = this.parser.parseBodyForUpdate(request);
      const { email } = request.user;
      const provider = await this.providerRepository.getByEmail(email);
      if (!provider)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Provider not found");
      const { id: providerId } = provider;
      const experienceInfo = await this.experienceInfoRepository.getById(id);
      if (!experienceInfo)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Experience not found");
      if (experienceInfo.providerUserId !== providerId)
        throw new HTTPError(
          HTTP_STATUS_CODE.FORBIDDEN,
          "You cannot update this experience"
        );
      const updatedExperienceInfo = await this.experienceInfoRepository.update({
        id,
        ...experienceInfoData,
      });
      reply.send(this.cleanExperienceInfoResponse(updatedExperienceInfo));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }
}

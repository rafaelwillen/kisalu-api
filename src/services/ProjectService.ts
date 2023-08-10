import { HTTP_STATUS_CODE } from "@/constants";
import ProjectParser from "@/parsers/ProjectParser";
import CategoryRepository from "@/repository/CategoryRepository";
import { ClientRepository } from "@/repository/ClientRepostory";
import ProjectRepository from "@/repository/ProjectRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import { handleServiceError } from ".";

export default class ProjectService {
  private projectRepository = new ProjectRepository();
  private clientRepository = new ClientRepository();
  private categoryRepository = new CategoryRepository();
  private readonly parser = new ProjectParser();

  async createProject(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const client = await this.clientRepository.getByEmail(email);
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      const { categoryName, ...parsedProject } =
        this.parser.parseBodyForCreation(request);
      const categoryToLink = await this.categoryRepository.getByName(
        categoryName
      );
      if (!categoryToLink)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      const createdProject = await this.projectRepository.create({
        ...parsedProject,
        userId: client.id,
        bannerImageURL: parsedProject.bannerImageURL || null,
        categoryId: categoryToLink.id,
        featuredImagesURL: parsedProject.featuredImagesURL || [],
      });
      return reply
        .code(HTTP_STATUS_CODE.CREATED)
        .send(omit(createdProject, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async changeProjectState(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id, state } = await this.getProjectFromUser(request);
      const updatedProject = await this.projectRepository.toggleToAvailable(
        id,
        state === "Available" ? "Draft" : "Available"
      );
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(updatedProject, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getAllFromClient(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.user;
      const userExists = await this.clientRepository.getByEmail(email);
      if (!userExists)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      const client = await this.clientRepository.getClientById(userExists.id);
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(
          client.createdProjects.map((project) =>
            omit(project, "userId", "categoryId")
          )
        );
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getPublicProjectById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: projectId } = this.parser.parseIdFromParams(request);
      const project = await this.projectRepository.getById(projectId);
      if (!project)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Project not found");
      if (project.state === "Draft")
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Project not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(project, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async getSingleProjectFromClient(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.user;
      const client = await this.clientRepository.getByEmail(email);
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      const { id: projectId } = this.parser.parseIdFromParams(request);
      const project = await this.projectRepository.getByIdFromOwner(
        projectId,
        client.id
      );
      if (!project)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Project not found");
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(project, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  async deleteProject(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = await this.getProjectFromUser(request);
      await this.projectRepository.delete(id);
      return reply.send();
    } catch (error) {
      handleServiceError(error, reply);
    }
  }

  private async getProjectFromUser(request: FastifyRequest) {
    const { email } = request.user;
    const client = await this.clientRepository?.getByEmail(email);
    if (!client)
      throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
    const { id: projectId } = this.parser.parseIdFromParams(request);
    const project = await this.projectRepository?.getByIdFromOwner(
      projectId,
      client.id
    );
    if (!project)
      throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Project not found");
    return project;
  }
}


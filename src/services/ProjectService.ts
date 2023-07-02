import { HTTP_STATUS_CODE } from "@/constants";
import { CategoryRepository } from "@/repository";
import ProjectRepository from "@/repository/ProjectRepository";
import UserRepository from "@/repository/UserRepository";
import HTTPError from "@/utils/error/HTTPError";
import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "underscore";
import z from "zod";
import { handleServiceError, parseIdParams } from ".";

export default class ProjectService {
  private projectRepository: ProjectRepository | undefined;
  private clientRepository: UserRepository | undefined;
  private categoryRepository: CategoryRepository | undefined;

  async createProject(request: FastifyRequest, reply: FastifyReply) {
    this.projectRepository = new ProjectRepository();
    this.clientRepository = new UserRepository();
    this.categoryRepository = new CategoryRepository();
    try {
      const { email } = request.user;
      const client = await this.clientRepository.getByEmail(email);
      this.clientRepository.close();
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      const { categoryName, ...parsedProject } =
        parseBodyForCreateProject(request);
      const categoryToLink = await this.categoryRepository.getByName(
        categoryName
      );
      this.categoryRepository.close();
      if (!categoryToLink)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Category not found");
      const createdProject = await this.projectRepository.create({
        ...parsedProject,
        userId: client.id,
        bannerImageURL: parsedProject.bannerImageURL || null,
        categoryId: categoryToLink.id,
        featuredImagesURL: parsedProject.featuredImagesURL || [],
      });
      this.projectRepository.close();
      return reply
        .code(HTTP_STATUS_CODE.CREATED)
        .send(omit(createdProject, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(
        error,
        [
          this.projectRepository,
          this.clientRepository,
          this.categoryRepository,
        ],
        reply
      );
    }
  }

  async changeProjectState(request: FastifyRequest, reply: FastifyReply) {
    this.projectRepository = new ProjectRepository();
    this.clientRepository = new UserRepository();
    try {
      const { email } = request.user;
      const client = await this.clientRepository.getByEmail(email);
      this.clientRepository.close();
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      const { id: projectId } = parseIdParams(request);
      const project = await this.projectRepository.getById(
        projectId,
        client.id
      );
      if (!project)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Project not found");
      const updatedProject = await this.projectRepository.toggleToAvailable(
        projectId,
        project.state === "Available" ? "Draft" : "Available"
      );
      this.projectRepository.close();
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(omit(updatedProject, "userId", "categoryId"));
    } catch (error) {
      handleServiceError(
        error,
        [this.projectRepository, this.clientRepository],
        reply
      );
    }
  }

  async getAllFromClient(request: FastifyRequest, reply: FastifyReply) {
    this.clientRepository = new UserRepository();
    try {
      const { email } = request.user;
      const userExists = await this.clientRepository.getByEmail(email);
      if (!userExists)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      const client = await this.clientRepository.getClientById(userExists.id);
      if (!client)
        throw new HTTPError(HTTP_STATUS_CODE.NOT_FOUND, "Client not found");
      this.clientRepository.close();
      return reply
        .code(HTTP_STATUS_CODE.OK)
        .send(
          client.createdProjects.map((project) =>
            omit(project, "userId", "categoryId")
          )
        );
    } catch (error) {
      handleServiceError(error, [this.clientRepository], reply);
    }
  }
}

function parseBodyForCreateProject(request: FastifyRequest) {
  const bodySchema = z
    .object({
      title: z.string().min(3),
      description: z.string().min(3),
      bannerImageURL: z.string().url().optional(),
      featuredImagesURL: z.array(z.string().url()).optional(),
      minimumPrice: z.number().int().min(0),
      maximumPrice: z.number().int().min(0),
      categoryName: z.string().min(3).max(255),
    })
    .refine(({ minimumPrice, maximumPrice }) => minimumPrice <= maximumPrice, {
      message: "Minimum price must be less than or equal to maximum price",
      path: ["minimumPrice", "maximumPrice"],
    });
  const parsedBody = bodySchema.parse(request.body);
  return parsedBody;
}

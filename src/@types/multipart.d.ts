import "@fastify/multipart";
declare module "@fastify/multipart" {
  export interface RequestFileTooLargeError {
    statusCode: number;
  }
}

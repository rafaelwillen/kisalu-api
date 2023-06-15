import { AddressService } from "@/services/AddressService";
import { FastifyInstance } from "fastify";

export default async function addressRoutes(
  app: FastifyInstance,
  option: any,
  done: () => void
) {
  const addressService = new AddressService();

  app.get("/province", addressService.getAllProvinces);
  app.get("/county/:province", addressService.getAllCountiesFromProvince);
  done();
}

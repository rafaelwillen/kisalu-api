import { AddressService } from "@/services/AddressService";
import { FastifyInstance } from "fastify";

export default async function addressRoutes(
  app: FastifyInstance,
  option: any,
  done: () => void
) {
  const addressService = new AddressService();

  app.get("/province", (req, rep) => addressService.getAllProvinces(req, rep));
  app.get("/county/:province", (req, rep) =>
    addressService.getAllCountiesFromProvince(req, rep)
  );
  done();
}

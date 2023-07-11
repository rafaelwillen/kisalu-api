import { Address } from "@prisma/client";
import { omit } from "underscore";
import Repository from "./Repository";

type AddressCreationType = Omit<Address, "id" | "activityId" | "userId">;
type AddressEditType = AddressCreationType & { id: string };

export default class AddressRepository extends Repository {
  constructor() {
    super();
  }

  async create(address: AddressCreationType) {
    const newAddress = await this.prisma.address.create({
      data: address,
    });
    return omit(newAddress, ["activityId", "userId"]);
  }

  async update({ id, ...address }: AddressEditType) {
    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: { ...address },
    });
    return omit(updatedAddress, ["activityId", "userId"]);
  }
}

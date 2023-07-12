import { Address } from "@prisma/client";
import { omit } from "underscore";
import Repository from "./Repository";

export type AddressCreationType = Omit<Address, "id" | "activityId" | "userId">;
export type AddressEditType = AddressCreationType & { id: string };

export default class AddressRepository extends Repository {
  constructor() {
    super();
  }

  async update({ id, ...address }: AddressEditType) {
    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: { ...address },
    });
    return omit(updatedAddress, ["activityId", "userId"]);
  }
}

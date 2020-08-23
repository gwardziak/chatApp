import { getRepository } from "typeorm";
import { User } from "../db/entities/User";

export const verifyUserToken = async (token: string) => {
  if (token) {
    const user = await getRepository(User).findOne({
      where: { authToken: token },
    });
    return user;
  }
};

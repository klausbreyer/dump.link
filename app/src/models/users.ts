import { User, UserID } from "../Project/types";

export function findUser(userId: UserID, users: User[]): User | undefined {
  return users.find((user) => user.userID === userId);
}

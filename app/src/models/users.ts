import { User, UserID } from "../Project/types";

export function findUser(users: User[], id: UserID): User | undefined {
  console.log("users", users);
  console.log("id", id);

  return users.find((user) => user.userID === id);
}

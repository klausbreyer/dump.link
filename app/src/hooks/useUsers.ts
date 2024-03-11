import { useEffect, useState } from "react";
import { User } from "../Project/types";
import { useApi } from "./useApi";

export const useUsers = (): User[] => {
  const api = useApi();

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await api.getUsers();
      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  return users;
};

import { useEffect, useState } from "react";
import { Project } from "../Project/types";
import { useApi } from "./useApi";

//@todo: probably build something generic or include it into the useapi that it can be called like:
// const users = useResponse<User[]>(...);
// but it is complicated, because api.functioncall is not a promise, but a function that returns a promise. so if we give it a new function every time, it will be called every time, ending in a infinity loop.
export const useProjects = (): Project[] => {
  const api = useApi();

  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await api.getProjects();
      setProjects(usersData);
    };

    fetchUsers();
  }, []);

  return projects;
};

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Project, User } from "../Project/types";
import { isOrgLink } from "../Routing";
import { useApi } from "../hooks/useApi";
import { useJWT } from "./jwt";
6;
interface OrgContextType {
  users: User[];
  projects: Project[];
}

const OrgContext = createContext<OrgContextType>({
  users: [],
  projects: [],
});

interface OrgProviderProps {
  children: ReactNode;
}

export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
  const { orgId, jwtLoading } = useJWT();
  const api = useApi(isOrgLink());

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isOrgLink()) return;
    if (jwtLoading) return;
    if (!orgId) return;

    const fetchUsers = async () => {
      const usersData = await api.getUsers();
      setUsers(usersData);
    };
    fetchUsers();
  }, [orgId]);

  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    if (!isOrgLink()) return;
    if (jwtLoading) return;
    if (!orgId) return;

    const fetchProjects = async () => {
      const projectsData = await api.getProjects();
      setProjects(projectsData);
    };
    fetchProjects();
  }, [orgId]);

  return (
    <OrgContext.Provider
      value={{
        users,
        projects,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg: () => OrgContextType = () => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
};

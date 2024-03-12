import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Project, User } from "../Project/types";
import { useApi } from "../hooks/useApi";
import { useOrgId } from "./orgId";
6;
interface OrgContextType {
  users: User[];
  projects: Project[];
  orgId: string | null;
  orgLoading: boolean;
}

const OrgContext = createContext<OrgContextType>({
  users: [],
  projects: [],
  orgId: null,
  orgLoading: false,
});

interface OrgProviderProps {
  children: ReactNode;
}

export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
  const { orgId, orgLoading } = useOrgId();
  const api = useApi(orgId ? true : false);

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    if (!orgId) return;

    const fetchUsers = async () => {
      const usersData = await api.getUsers();
      setUsers(usersData);
    };
    fetchUsers();
  }, [orgId]);

  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
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
        orgLoading,
        orgId,
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

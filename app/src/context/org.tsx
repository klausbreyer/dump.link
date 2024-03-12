import { useAuth0 } from "@auth0/auth0-react";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Project, User } from "../Project/types";
import { useApi } from "../hooks/useApi";

interface OrgContextType {
  users: User[];
  projects: Project[];
}

const OrgContext = createContext<OrgContextType>({ users: [], projects: [] });

interface OrgProviderProps {
  children: ReactNode;
}

export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
  const api = useApi();
  const { isLoading, isAuthenticated } = useAuth0();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const fetchUsers = async () => {
      const usersData = await api.getUsers();
      setUsers(usersData);
    };
    fetchUsers();
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const fetchProjects = async () => {
      const projectsData = await api.getProjects();
      setProjects(projectsData);
    };
    fetchProjects();
  }, [isLoading, isAuthenticated]);

  return (
    <OrgContext.Provider value={{ users, projects }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = (): OrgContextType => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
};

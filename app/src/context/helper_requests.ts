import { ProjectID, UserName, lastAccessedProject } from "../types";

export const extractIdFromUrl = () => {
  const url = window.location.pathname;
  const parts = url.split("/");
  return parts[parts.length - 1];
};

export const lastActivityKey = (projectId: ProjectID): string => {
  return `lastActivity_${projectId}`;
};
function MockedDate(): Date {
  const mocked = new Date();
  mocked.setMinutes(mocked.getMinutes() - 10);
  return mocked;
}

export const getLastActivity = (projectId: ProjectID): Date | null => {
  const key = lastActivityKey(projectId);

  const dateString = localStorage.getItem(key);

  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return MockedDate();
  return date;
};

export const saveLastActivity = (projectId: ProjectID) => {
  const key = lastActivityKey(projectId);
  const now = new Date();
  localStorage.setItem(key, now.toISOString());
};

export const saveProjectIdToLocalStorage = (
  projectId: string,
  projectName: string,
) => {
  const savedProjects = localStorage.getItem("recentProjects");
  let recentProjects = savedProjects ? JSON.parse(savedProjects) : [];

  const existingProjectIndex = recentProjects.findIndex(
    (p: lastAccessedProject) => p.id === projectId,
  );
  const projectData = {
    id: projectId,
    name: projectName,
    lastAccessed: new Date().toISOString(),
  };

  if (existingProjectIndex > -1) {
    // Update existing project data
    recentProjects[existingProjectIndex] = projectData;
  } else {
    // Add new project data
    recentProjects.push(projectData);
  }

  // Sort the projects by last accessed date
  recentProjects = recentProjects.sort(
    (a: lastAccessedProject, b: lastAccessedProject) =>
      new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime(),
  );

  localStorage.setItem("recentProjects", JSON.stringify(recentProjects));
};

// NewID generates a random base-58 ID with optional prefixes.
export function NewID(...prefixes: string[]): string {
  const crypto = window.crypto || (window as any).msCrypto;
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // base58
  const size = 11;

  // Concatenate all prefixes if provided
  const prefix = prefixes.join("");

  // Create an array for the ID
  const id = new Array(size);

  for (let i = 0; i < size; i++) {
    const randomValue = crypto.getRandomValues(new Uint8Array(1))[0];
    id[i] = alphabet[randomValue % alphabet.length];
  }

  return prefix + id.join("");
}

export function getUsername(): UserName {
  return localStorage.getItem("username") || "";
}

export function getInitials(username: UserName) {
  if (username.length === 0) return "";
  if (username.length < 3) return username;

  const parts = username.split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0) + parts[0].charAt(1);
  } else {
    return parts[0].charAt(0) + parts[1].charAt(0);
  }
}

import { lastAccessedProject } from "../Project/types";

export const saveProjectIdToLocalStorage = (
  projectId: string,
  projectName: string,
  orgId: string,
) => {
  const savedProjects = localStorage.getItem("recentProjects");
  let recentProjects = savedProjects ? JSON.parse(savedProjects) : [];

  const existingProjectIndex = recentProjects.findIndex(
    (p: lastAccessedProject) => p.id === projectId,
  );
  const projectData = {
    id: projectId,
    name: projectName,
    orgId: orgId,
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

import { Project } from "../Project/types";

export const getEndingAt = (project: Project) => {
  const { appetite, endingAt } = project;
  if (appetite === 0 && endingAt) {
    return endingAt;
  } else {
    const startedAt = project.startedAt;
    return new Date(startedAt.getTime() + appetite * 7 * 24 * 60 * 60 * 1000);
  }
};

export const projectIsPublic = (project: Project) => {
  return !(project.orgId.length > 0);
};

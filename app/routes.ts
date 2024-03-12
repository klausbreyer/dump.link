export enum AppContext { //used as links
  Dashboard = "dashboard",
  Callback = "callback",
  Login = "login",
  Signup = "signup",
  New = "new",
  OrgStub = "o",
  ProjectStub = "p",
}

export const paths = {
  publicProject: `/:projectId/*`,
  orgProject: `/${AppContext.OrgStub}/:orgId/p/:projectId/*`,
  orgDashboard: `/${AppContext.OrgStub}/:orgId/${AppContext.Dashboard}`,
  callback: `/${AppContext.Callback}`,
  new: `/${AppContext.New}`,
  login: `/${AppContext.Login}`,
  signup: `/${AppContext.Signup}`,
};

export const links = {
  publicProject: (projectId: string) =>
    paths.publicProject.replace(":projectId", projectId).replace("/*", ""),
  orgProject: (orgId: string, projectId: string) =>
    paths.orgProject
      .replace(":orgId", orgId)
      .replace(":projectId", projectId)
      .replace("/*", ""),
  orgDashboard: (orgId: string) => paths.orgDashboard.replace(":orgId", orgId),
  new: paths.new,
};

export function isOrgLink(): boolean {
  return location.pathname.includes(`/${AppContext.OrgStub}/`);
}

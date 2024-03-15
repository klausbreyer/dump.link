import { Route, Routes } from "react-router-dom";
import Callback from "./Dashboard/Callback";
import Dashboard from "./Dashboard/Dashboard";
import Login from "./Dashboard/Login";
import New from "./Dashboard/New";
import Signup from "./Dashboard/Signup";
import Project from "./Project/Project";
import { NotFoundPage } from "./Project/context/lifecycle";

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
  publicProject: `/p/:projectId/*`,
  orgProject: `/${AppContext.OrgStub}/:orgId/p/:projectId/*`,
  orgDashboard: `/${AppContext.OrgStub}/:orgId/${AppContext.Dashboard}`,
  callback: `/${AppContext.Callback}`,
  publicNew: `/${AppContext.New}`,
  orgNew: `/${AppContext.OrgStub}/:orgId/${AppContext.New}`,
  login: `/${AppContext.Login}`,
  signup: `/${AppContext.Signup}`,
};

const Routing = function Routing() {
  return (
    <Routes>
      <Route path={paths.publicProject} element={<Project />} />
      <Route path={paths.orgProject} element={<Project />} />
      <Route path={paths.orgDashboard} element={<Dashboard />} />
      <Route path={paths.callback} element={<Callback />} />
      <Route path={paths.orgNew} element={<New />} />
      <Route path={paths.publicNew} element={<New />} />
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.signup} element={<Signup />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Routing;

export const links = {
  publicProject: (projectId: string) =>
    paths.publicProject.replace(":projectId", projectId).replace("/*", ""),
  orgProject: (orgId: string, projectId: string) =>
    paths.orgProject
      .replace(":orgId", orgId)
      .replace(":projectId", projectId)
      .replace("/*", ""),
  orgDashboard: (orgId: string) => paths.orgDashboard.replace(":orgId", orgId),
  publicNew: paths.publicNew,
  orgNew: (orgId: string) => paths.orgNew.replace(":orgId", orgId),
  login: paths.login,
  signup: paths.signup,
  callback: paths.callback,
};

export function isOrgLink(): boolean {
  return location.pathname.includes(`/${AppContext.OrgStub}/`);
}

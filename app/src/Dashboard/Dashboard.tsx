import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import DLMenu from "../Menu/Menu";
import { LifecycleState, useLifecycle } from "../Project/context/lifecycle";
import { links } from "../Routing";
import { LoginRequired } from "../common/Alert";
import Container from "../common/Container";
import { useOrg } from "../context/org";
import { getEndingAt } from "../models/projects";
import { findUser } from "../models/users";
import { dateToISO, formatDate } from "../utils/dates";

const statuses = {
  Complete: "text-green-700 bg-green-50 ring-green-600/20",
  wip: "text-gray-600 bg-gray-50 ring-gray-500/10",
  Archived: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
  Owner: "text-indigo-700 bg-indigo-50 ring-indigo-600/20",
};

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const { setLifecycle } = useLifecycle();

  const { projects, users } = useOrg();

  useEffect(() => {
    if (isLoading) return;
    setLifecycle(LifecycleState.Loaded);
  }, [isLoading]);

  if (!isAuthenticated) {
    return <LoginRequired />;
  }

  return (
    <>
      <DLMenu />
      <Container>
        {isAuthenticated && user && projects && users && (
          <>
            <div className="m-10">
              <h1 className="text-lg font-bold text-slate-700">
                All dumplinks of your organization
              </h1>
              <ul>
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex items-center justify-between py-5 gap-x-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-x-3">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          <Link
                            to={links.orgProject(project.orgId, project.id)}
                            reloadDocument={true}
                            className="hover:underline"
                          >
                            {project.name}
                          </Link>
                        </p>
                        {project.createdBy === user.sub && (
                          <p
                            className={` ${statuses.Owner} rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset`}
                          >
                            Owner
                          </p>
                        )}
                        {project.archived && (
                          <p
                            className={` ${statuses.Archived} rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset`}
                          >
                            Archived
                          </p>
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
                        <p className="whitespace-nowrap">
                          Due on{" "}
                          <time dateTime={dateToISO(getEndingAt(project))}>
                            {formatDate(getEndingAt(project))}
                          </time>
                        </p>
                        <svg
                          viewBox="0 0 2 2"
                          className="h-0.5 w-0.5 fill-current"
                        >
                          <circle cx={1} cy={1} r={1} />
                        </svg>
                        <p className="truncate">
                          Created by {findUser(project.createdBy, users)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center flex-none gap-x-4">
                      <Link
                        to={links.orgProject(project.orgId, project.id)}
                        reloadDocument={true}
                        className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                      >
                        View project
                        <span className="sr-only">, {project.name}</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

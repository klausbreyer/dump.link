import { useAuth0 } from "@auth0/auth0-react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { AppContext } from "../../types"; // Make sure this path matches your file structure
import DLMenu from "../Menu/Menu";
import Alert from "../common/Alert";

export default function LoginSuccess() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    // Handle the not authenticated state appropriately.
    return <div>User is not authenticated.</div>;
  }

  return (
    <>
      <DLMenu />
      <Alert>
        <div className="p-4 rounded-md bg-green-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="w-5 h-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Login Successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Authenticated as {user.email}! You can now access your
                  dashboard.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to={`${AppContext.Dashboard}`}
                    className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                  >
                    Continue to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Alert>
    </>
  );
}

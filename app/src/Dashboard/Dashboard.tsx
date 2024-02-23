import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import Container from "../common/Container";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import Alert from "../common/Alert";
import DLMenu from "../Menu/Menu";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    if (!user?.sub) return;

    const getUserMetadata = async () => {
      try {
        const accessToken = await getAccessTokenSilently();

        console.log(accessToken);
        const decoded = jwtDecode(accessToken);

        console.log(decoded);
      } catch (e: any) {
        console.log(e.message);
      }
    };

    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <>
      <DLMenu />
      <Container>
        {!isAuthenticated && (
          <Alert>
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon
                    className="h-5 w-5 text-yellow-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Login Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You must log in to access the dashboard and view all your
                      dumplinks. Please log in to continue and unlock the full
                      features of your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Alert>
        )}
        {isAuthenticated && user && (
          <div className="m-10">Here goes the Dashboard..</div>
        )}
      </Container>
    </>
  );
}

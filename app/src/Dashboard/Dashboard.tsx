import { useAuth0 } from "@auth0/auth0-react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";
import DLMenu from "../Menu/Menu";
import Alert from "../common/Alert";
import Container from "../common/Container";

export default function Dashboard() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    if (!user?.sub) return;

    const getUserMetadata = async () => {
      try {
        const accessToken = await getAccessTokenSilently();

        console.log(accessToken);
      } catch (e: any) {
        console.log(e.message);
      }
    };

    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  return (
    <>
      <DLMenu />
      <Container>
        {!isAuthenticated && (
          <Alert>
            <div className="p-4 rounded-md bg-yellow-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon
                    className="w-5 h-5 text-yellow-400"
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

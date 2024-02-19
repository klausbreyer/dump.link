import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import InfoButton from "../common/InfoButton";

export default function Dashboard() {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
  } = useAuth0();

  useEffect(() => {
    if (!user?.sub) return;

    const getUserMetadata = async () => {
      const domain = "dumplink.eu.auth0.com";

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
      <div>
        <InfoButton color="indigo" onClick={() => loginWithRedirect()}>
          Login
        </InfoButton>
        <InfoButton
          color="indigo"
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Logout
        </InfoButton>
        {isAuthenticated && user && (
          <div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        )}
      </div>
    </>
  );
}

import { useAuth0 } from "@auth0/auth0-react";
import InfoButton from "../common/InfoButton";
import { useHref, useLocation } from "react-router-dom";
import { AppContext } from "../../types";

export default function Dashboard() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  const basename = useHref("/");

  const redirect_uri = `${window.location.origin}${basename}/${AppContext.Callback}`;

  return (
    <div>
      <InfoButton
        color="indigo"
        onClick={() =>
          loginWithRedirect({
            authorizationParams: {
              redirect_uri,
            },
          })
        }
      >
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
  );
}

import { useAuth0 } from "@auth0/auth0-react";
import InfoButton from "../common/InfoButton";

export default function Dashboard() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  console.log(user, isAuthenticated, isLoading);

  return (
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
  );
}

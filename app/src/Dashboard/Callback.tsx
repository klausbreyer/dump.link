import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { AppContext } from "../../types";

export default function Callback() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <div>
      {isAuthenticated && user && (
        <>
          Authenticated as {user.email}!{" "}
          <Link
            to={`/${AppContext.Dashboard}`}
            className="text-indigo-500 hover:underline"
          >
            Continue
          </Link>
        </>
      )}
    </div>
  );
}

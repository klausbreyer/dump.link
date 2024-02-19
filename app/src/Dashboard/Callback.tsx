import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../types";

export default function Callback() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

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
          <pre>{JSON.stringify(user)}</pre>
        </>
      )}
    </div>
  );
}

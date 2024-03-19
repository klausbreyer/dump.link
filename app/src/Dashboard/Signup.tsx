import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export default function Signup() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
    });
  }, [loginWithRedirect]);

  return (
    <div className="flex items-center justify-center h-screen">
      <a>Redirecting to Signup</a>
    </div>
  );
}

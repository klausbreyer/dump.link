import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserID } from "../Project/types";

type JWTContextType = {
  orgId: string | null;
  sub: UserID | null;
  jwtLoading: boolean;
};

const JWTContext = createContext<JWTContextType | undefined>(undefined);

/**
 * This needs to be on top of everything else, but below Auth0.
 * It provided the ID and the check if this is an org logged in user.
 * We check this during a lot of places, among other the useApi.
 * @param param0
 * @returns
 */
export const JWTProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [sub, setSub] = useState<UserID | null>(null);
  const [jwtLoading, setJWTLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      (async () => {
        const token = await getAccessTokenSilently();
        const decoded: { org_id: string; sub: UserID } = jwtDecode(token);

        setSub(decoded.sub as UserID);
        setOrgId(decoded.org_id);
        setJWTLoading(false);
        console.log(token);
        console.dir(decoded);
      })();
    } else {
      setJWTLoading(false);
    }
  }, [isAuthenticated, isLoading, jwtLoading, getAccessTokenSilently]);

  return (
    <JWTContext.Provider value={{ orgId, sub, jwtLoading }}>
      {children}
    </JWTContext.Provider>
  );
};

export const useJWT = (): JWTContextType => {
  const context = useContext(JWTContext);
  if (context === undefined) {
    throw new Error("useOrgId must be used within a OrgIdProvider");
  }
  return context;
};

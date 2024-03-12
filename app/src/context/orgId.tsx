import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";

type OrgIdContextType = {
  orgId: string | null;
  orgLoading: boolean;
};

const OrgIdContext = createContext<OrgIdContextType | undefined>(undefined);

/**
 * This needs to be on top of everything else, but below Auth0.
 * It provided the ID and the check if this is an org logged in user.
 * We check this during a lot of places, among other the useApi.
 * @param param0
 * @returns
 */
export const OrgIdProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !orgLoading) return;
    (async () => {
      const token = await getAccessTokenSilently();
      const decoded: { org_id: string } = jwtDecode(token);

      console.log(token);
      console.dir(decoded);

      setOrgId(decoded.org_id);
      setOrgLoading(false);
    })();
  }, [isAuthenticated, isLoading, orgLoading, getAccessTokenSilently]);

  return (
    <OrgIdContext.Provider value={{ orgId, orgLoading }}>
      {children}
    </OrgIdContext.Provider>
  );
};

export const useOrgId = (): OrgIdContextType => {
  const context = useContext(OrgIdContext);
  if (context === undefined) {
    throw new Error("useOrgId must be used within a OrgIdProvider");
  }
  return context;
};

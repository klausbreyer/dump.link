import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { useHref } from "react-router-dom";
import { AppContext } from "../types";

interface Auth0ProviderConfiguredProps {
  children: React.ReactNode;
}

export const Auth0ProviderConfigured: React.FC<
  Auth0ProviderConfiguredProps
> = ({ children }) => {
  const basename = useHref("/");
  const redirectUri = `${window.location.origin}${basename}/${AppContext.Callback}`;
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const audience = process.env.AUTH0_AUDIENCE;

  if (!(domain && clientId && redirectUri && audience)) {
    console.error("Auth0 environment variables not set.");
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      authorizationParams={{
        audience: audience,
        redirect_uri: redirectUri,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

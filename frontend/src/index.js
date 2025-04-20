// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com",
  client_id: "3tdd1ec5am5tci65s7tdkofpv4",
  redirect_uri: "https://todo-app.natsuki-cloud.dev/callback",
  response_type: "code",
  scope: "email openid profile",
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  metadata: {
    issuer: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_rHCqR8mhF",
    authorization_endpoint: "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize",
    token_endpoint: "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com/oauth2/token",
    userinfo_endpoint: "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com/oauth2/userInfo",
    end_session_endpoint: "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com/logout",
    jwks_uri: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_rHCqR8mhF/.well-known/jwks.json"
  }
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
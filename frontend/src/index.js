// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_rHCqR8mhF",
  client_id: "3tdd1ec5am5tci65s7tdkofpv4",
  redirect_uri: "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse",
  response_type: "code",
  scope: "email openid profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
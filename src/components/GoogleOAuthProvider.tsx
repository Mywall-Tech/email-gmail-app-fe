import { GoogleOAuthProvider as GoogleProvider } from "@react-oauth/google";
import React from "react";

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
}

const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({
  children,
}) => {
  // You'll need to get this from Google Cloud Console
  const googleClientId =
    "74039262987-veogjg626f4d2v6cn8th1rtmv7clga1e.apps.googleusercontent.com";

  if (!googleClientId) {
    console.warn(
      "Google Client ID not found. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file"
    );
    return <>{children}</>;
  }

  return <GoogleProvider clientId={googleClientId}>{children}</GoogleProvider>;
};

export default GoogleOAuthProvider;

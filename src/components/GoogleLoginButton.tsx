import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Send the Google credential to your backend for verification
      const response = await fetch(
        "https://gmail-email-app-production.up.railway.app/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        login(data.token, data.user);
        navigate("/dashboard");
        onSuccess?.();
      } else {
        const errorData = await response.json();
        onError?.(errorData.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      onError?.("Google login failed");
    }
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
    onError?.("Google login failed");
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleLoginButton;

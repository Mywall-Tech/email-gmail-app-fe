import { useGoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface GmailConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const GOOGLE_LOGIN_SCOPES = "https://www.googleapis.com/auth/gmail.send";

const GmailConnectButton: React.FC<GmailConnectButtonProps> = ({
  onSuccess,
  onError,
  className = "",
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateGmailToken = async (codeResponse: any) => {
    console.log("Google OAuth response:", codeResponse);
    setLoading(true);
    try {
      if (codeResponse?.code) {
        // Send the authorization code to your backend
        const response = await fetch(
          "https://gmail-email-app-production.up.railway.app/api/auth/google/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: codeResponse.code,
              scope: codeResponse.scope,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          login(result.token, result.user);
          navigate("/dashboard");
          onSuccess?.();
        } else {
          const errorData = await response.json();
          onError?.(errorData.error || "Authentication failed");
        }
      } else {
        onError?.("No valid authorization data received from Google");
      }
    } catch (error: any) {
      console.error("Gmail connection error:", error);
      onError?.(error.message || "Failed to connect Gmail");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: GOOGLE_LOGIN_SCOPES,
    onSuccess: updateGmailToken,
    onError: (error) => {
      console.error("Google login error:", error);
      setLoading(false);
      onError?.("Google login was cancelled or failed");
    },
  });

  const handleClick = () => {
    setLoading(true);
    console.log("Google login started");
    googleLogin();
  };

  return (
    <div className={`google-login-wrapper ${className}`}>
      {children || (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="auth-button google-login-button"
        >
          {loading ? "Connecting..." : "🔗 Connect Gmail Account"}
        </button>
      )}
    </div>
  );
};

export default GmailConnectButton;

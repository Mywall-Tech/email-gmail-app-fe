import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginSocialGoogle } from "reactjs-social-login";
import { useAuth } from "../context/AuthContext";

interface GmailConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}
const GOOGLE_CLIENT_ID =
  "74039262987-veogjg626f4d2v6cn8th1rtmv7clga1e.apps.googleusercontent.com";
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

  const updateGmailToken = async (data: any) => {
    console.log("Google OAuth response:", data);
    setLoading(true);
    try {
      if (data?.provider === "google" && data?.data?.code) {
        // Send the authorization code to your backend
        const response = await fetch(
          "https://gmail-email-app-production.up.railway.app/api/auth/google/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: data.data.code,
              scope: data.data.scope,
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
      } else if (data?.access_token) {
        // Fallback for direct access token (older flow)
        const response = await fetch(
          "https://gmail-email-app-production.up.railway.app/api/auth/google",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: data.access_token,
              id_token: data.id_token,
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

  const handleLoginStart = () => {
    setLoading(true);
    console.log("Google login started");
  };

  const handleReject = (error: any) => {
    setLoading(false);
    console.error("Google login rejected:", error);
    onError?.("Google login was cancelled or failed");
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="error-message">
        Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID
        in your .env file.
      </div>
    );
  }

  return (
    <LoginSocialGoogle
      client_id={GOOGLE_CLIENT_ID}
      scope={GOOGLE_LOGIN_SCOPES}
      access_type="offline"
      onResolve={(data) => updateGmailToken(data)}
      onLoginStart={handleLoginStart}
      onReject={handleReject}
      className={`google-login-wrapper ${className}`}
    >
      {children || (
        <button
          type="button"
          disabled={loading}
          className="auth-button google-login-button"
        >
          {loading ? "Connecting..." : "🔗 Connect Gmail Account"}
        </button>
      )}
    </LoginSocialGoogle>
  );
};

export default GmailConnectButton;

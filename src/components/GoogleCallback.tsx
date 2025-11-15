import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          setError("Google authentication was cancelled or failed");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Send the authorization code to your backend
        const response = await fetch(
          "https://gmail-email-app-production.up.railway.app/api/auth/google/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          login(data.token, data.user);
          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Authentication failed");
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Authentication Error</h2>
          <div className="error-message">{error}</div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <LoadingSpinner message="Completing Google authentication..." />;
};

export default GoogleCallback;

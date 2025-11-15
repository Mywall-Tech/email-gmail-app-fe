import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { gmailAPI } from "../services/api";
import { GmailStatus, SendEmailRequest } from "../types";
import BulkEmailUpload from "./BulkEmailUpload";
import "./Dashboard.css";
import EmailHistoryComponent from "./EmailHistory";
import GmailConnectButton from "./GmailConnectButton";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email form state
  const [emailForm, setEmailForm] = useState<SendEmailRequest>({
    to: "",
    subject: "",
    body: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Tab state for switching between single, bulk email, and history
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "history">(
    "single"
  );

  useEffect(() => {
    fetchGmailStatus();
  }, []);

  const fetchGmailStatus = async () => {
    try {
      const status = await gmailAPI.getStatus();
      setGmailStatus(status);
    } catch (err: any) {
      console.error("Failed to fetch Gmail status:", err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    setError("");
    setSuccess("");

    try {
      await gmailAPI.sendEmail(emailForm);
      setSuccess("Email sent successfully!");
      setEmailForm({ to: "", subject: "", body: "" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleInputChange = (field: keyof SendEmailRequest, value: string) => {
    setEmailForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Email Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Gmail Connection Status */}
        <div className="card">
          <h2>Gmail Connection</h2>
          {gmailStatus ? (
            <div
              className={`status ${
                gmailStatus.connected ? "connected" : "disconnected"
              }`}
            >
              <p>
                Status:{" "}
                {gmailStatus.connected ? "✅ Connected" : "❌ Not Connected"}
              </p>
              {gmailStatus.connected && (
                <div>
                  <p>
                    Expires:{" "}
                    {new Date(gmailStatus.expires_at!).toLocaleString()}
                  </p>
                  {gmailStatus.expired && (
                    <p className="warning">⚠️ Token expired</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>Loading Gmail status...</p>
          )}

          {!gmailStatus?.connected && (
            <GmailConnectButton
              onSuccess={() => {
                setSuccess("Gmail account connected successfully!");
                fetchGmailStatus();
              }}
              onError={(err) => setError(err)}
              className="connect-button"
            />
          )}
        </div>

        {/* Email Management Section */}
        {gmailStatus?.connected && !gmailStatus.expired && (
          <div className="card">
            <div className="email-tabs">
              <button
                className={`tab-button ${
                  activeTab === "single" ? "active" : ""
                }`}
                onClick={() => setActiveTab("single")}
              >
                Single Email
              </button>
              <button
                className={`tab-button ${activeTab === "bulk" ? "active" : ""}`}
                onClick={() => setActiveTab("bulk")}
              >
                Bulk Email
              </button>
              <button
                className={`tab-button ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                Email History
              </button>
            </div>

            {activeTab === "single" && (
              <div className="tab-content">
                <h2>Send Single Email</h2>
                <form onSubmit={handleSendEmail} className="email-form">
                  <div className="form-group">
                    <label htmlFor="to">To:</label>
                    <input
                      type="email"
                      id="to"
                      value={emailForm.to}
                      onChange={(e) => handleInputChange("to", e.target.value)}
                      required
                      disabled={sendingEmail}
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject:</label>
                    <input
                      type="text"
                      id="subject"
                      value={emailForm.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      required
                      disabled={sendingEmail}
                      placeholder="Email subject"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="body">Message:</label>
                    <textarea
                      id="body"
                      value={emailForm.body}
                      onChange={(e) =>
                        handleInputChange("body", e.target.value)
                      }
                      required
                      disabled={sendingEmail}
                      rows={6}
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="send-button"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "bulk" && (
              <div className="tab-content">
                <BulkEmailUpload
                  onSuccess={(message) => {
                    setSuccess(message);
                    setError("");
                  }}
                  onError={(error) => {
                    setError(error);
                    setSuccess("");
                  }}
                />
              </div>
            )}

            {activeTab === "history" && (
              <div className="tab-content">
                <EmailHistoryComponent
                  onError={(error) => {
                    setError(error);
                    setSuccess("");
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
};

export default Dashboard;

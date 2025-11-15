import React, { useState } from "react";
import { gmailAPI } from "../services/api";
import { BulkEmailResponse, ProcessCSVResponse } from "../types";
import "./BulkEmailUpload.css";

interface BulkEmailUploadProps {
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

const BulkEmailUpload: React.FC<BulkEmailUploadProps> = ({
  onSuccess,
  onError,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ProcessCSVResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkEmailResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Email content state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        onError("Please select a CSV file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        onError("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setCsvData(null);
      setBulkResult(null);
    }
  };

  const handleProcessCSV = async () => {
    if (!file) {
      onError("Please select a CSV file first");
      return;
    }

    setProcessing(true);
    try {
      const result = await gmailAPI.processCSV(file);
      setCsvData(result);
      setShowPreview(true);

      if (result.errors && result.errors.length > 0) {
        onError(
          `CSV processed with ${result.errors.length} errors. Check the preview for details.`
        );
      } else {
        onSuccess(
          `Successfully processed ${result.valid_emails.length} emails from CSV`
        );
      }
    } catch (err: any) {
      onError(err.response?.data?.error || "Failed to process CSV file");
    } finally {
      setProcessing(false);
    }
  };

  const handleSendBulkEmails = async () => {
    if (!csvData || csvData.valid_emails.length === 0) {
      onError("No valid emails to send");
      return;
    }

    if (!subject.trim()) {
      onError("Please enter an email subject");
      return;
    }

    if (!body.trim()) {
      onError("Please enter an email body");
      return;
    }

    setSending(true);
    try {
      const result = await gmailAPI.sendBulkEmails({
        subject: subject.trim(),
        body: body.trim(),
        emails: csvData.valid_emails,
      });
      setBulkResult(result);

      if (result.success_count > 0) {
        onSuccess(
          `Successfully sent ${result.success_count} out of ${result.total_emails} emails`
        );
      }

      if (result.failure_count > 0) {
        onError(
          `${result.failure_count} emails failed to send. Check results for details.`
        );
      }
    } catch (err: any) {
      onError(err.response?.data?.error || "Failed to send bulk emails");
    } finally {
      setSending(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ["email", "name"],
      ["john@example.com", "John Doe"],
      ["jane@example.com", "Jane Smith"],
      ["bob@example.com", "Bob Johnson"],
      ["alice@example.com", "Alice Brown"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_bulk_emails.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bulk-email-upload">
      <div className="upload-section">
        <h3>Bulk Email Upload</h3>
        <p className="description">
          Upload a CSV file containing email addresses and names, then enter
          your email content below to send the same personalized message to all
          recipients.
        </p>

        <div className="csv-format-info">
          <h4>CSV Format Requirements:</h4>
          <ul>
            <li>
              <strong>email</strong> (required): Recipient email address
            </li>
            <li>
              <strong>name</strong> (optional): Recipient name for
              personalization
            </li>
          </ul>
          <p>
            You'll enter the subject and message content below. Use{" "}
            <code>{"{{name}}"}</code> in your message body to personalize emails
            with each recipient's name.
          </p>
          <button
            type="button"
            onClick={downloadSampleCSV}
            className="download-sample-btn"
          >
            Download Sample CSV
          </button>
        </div>

        <div className="file-upload">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="file-input"
            id="csv-file"
          />
          <label htmlFor="csv-file" className="file-label">
            {file ? file.name : "Choose CSV File"}
          </label>
        </div>

        {file && (
          <div className="file-actions">
            <button
              onClick={handleProcessCSV}
              disabled={processing}
              className="process-btn"
            >
              {processing ? "Processing..." : "Process CSV"}
            </button>
          </div>
        )}
      </div>

      {/* Email Content Form */}
      {csvData && csvData.valid_emails.length > 0 && (
        <div className="email-content-section">
          <h3>Email Content</h3>
          <p className="content-description">
            Enter the subject and message that will be sent to all recipients.
            Use <code>{"{{name}}"}</code> to personalize with each recipient's
            name.
          </p>

          <div className="email-form">
            <div className="form-group">
              <label htmlFor="bulk-subject">Subject:</label>
              <input
                type="text"
                id="bulk-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="subject-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bulk-body">Message:</label>
              <textarea
                id="bulk-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your message here. Use {{name}} to personalize with recipient names."
                rows={6}
                className="body-textarea"
              />
            </div>
          </div>
        </div>
      )}

      {csvData && (
        <div className="csv-preview">
          <div className="preview-header">
            <h4>CSV Processing Results</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="toggle-preview-btn"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          <div className="processing-summary">
            <p>
              <strong>Total Records:</strong> {csvData.total_records}
            </p>
            <p>
              <strong>Valid Emails:</strong> {csvData.valid_emails.length}
            </p>
            {csvData.errors && csvData.errors.length > 0 && (
              <p className="error-count">
                <strong>Errors:</strong> {csvData.errors.length}
              </p>
            )}
          </div>

          {csvData.errors && csvData.errors.length > 0 && (
            <div className="csv-errors">
              <h5>Processing Errors:</h5>
              <ul>
                {csvData.errors.map((error, index) => (
                  <li key={index} className="error-item">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showPreview && csvData.valid_emails.length > 0 && (
            <div className="email-preview">
              <h5>Recipients Preview (first 10 recipients):</h5>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.valid_emails.slice(0, 10).map((email, index) => (
                      <tr key={index}>
                        <td>{email.email}</td>
                        <td>{email.name || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.valid_emails.length > 10 && (
                  <p className="more-emails">
                    ...and {csvData.valid_emails.length - 10} more recipients
                  </p>
                )}
              </div>
            </div>
          )}

          {csvData.valid_emails.length > 0 && (
            <div className="send-actions">
              <button
                onClick={handleSendBulkEmails}
                disabled={sending || !subject.trim() || !body.trim()}
                className="send-bulk-btn"
              >
                {sending
                  ? "Sending Emails..."
                  : `Send ${csvData.valid_emails.length} Emails`}
              </button>
              {(!subject.trim() || !body.trim()) && (
                <p className="send-requirement">
                  Please enter both subject and message content above to send
                  emails.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {bulkResult && (
        <div className="bulk-results">
          <h4>Bulk Email Results</h4>
          <div className="results-summary">
            <p>
              <strong>Total Emails:</strong> {bulkResult.total_emails}
            </p>
            <p className="success">
              <strong>Successful:</strong> {bulkResult.success_count}
            </p>
            <p className="failure">
              <strong>Failed:</strong> {bulkResult.failure_count}
            </p>
            <p>
              <strong>Processing Time:</strong> {bulkResult.processing_time}
            </p>
          </div>

          {bulkResult.failure_count > 0 && (
            <div className="failed-emails">
              <h5>Failed Emails:</h5>
              <div className="failed-list">
                {bulkResult.results
                  .filter((result) => !result.success)
                  .map((result, index) => (
                    <div key={index} className="failed-item">
                      <strong>{result.email}:</strong> {result.error}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkEmailUpload;

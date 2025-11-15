import React, { useCallback, useEffect, useState } from "react";
import { gmailAPI } from "../services/api";
import {
  EmailHistory,
  EmailHistoryResponse,
  EmailHistoryStats,
} from "../types";
import "./EmailHistory.css";

interface EmailHistoryProps {
  onError: (error: string) => void;
}

const EmailHistoryComponent: React.FC<EmailHistoryProps> = ({ onError }) => {
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [stats, setStats] = useState<EmailHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const pageSize = 10;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response: EmailHistoryResponse = await gmailAPI.getEmailHistory(
        currentPage,
        pageSize,
        filterType || undefined
      );
      setHistory(response.history);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
    } catch (err: any) {
      onError(err.response?.data?.error || "Failed to fetch email history");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, onError]);

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [fetchHistory]);

  const fetchStats = async () => {
    try {
      const statsData = await gmailAPI.getEmailHistoryStats();
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to fetch email stats:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`status-badge ${status}`}>
        {status === "sent" ? "✅ Sent" : "❌ Failed"}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <span className={`type-badge ${type}`}>
        {type === "single" ? "📧 Single" : "📬 Bulk"}
      </span>
    );
  };

  return (
    <div className="email-history">
      <div className="history-header">
        <h2>Email History</h2>
        <p className="history-description">
          Track all your sent emails and their delivery status
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card success">
            <div className="stat-number">{stats.total_sent}</div>
            <div className="stat-label">Total Sent</div>
          </div>
          <div className="stat-card error">
            <div className="stat-number">{stats.total_failed}</div>
            <div className="stat-label">Total Failed</div>
          </div>
          <div className="stat-card info">
            <div className="stat-number">{stats.last_7_days_sent}</div>
            <div className="stat-label">Last 7 Days</div>
          </div>
          <div className="stat-card neutral">
            <div className="stat-number">
              {stats.single_emails + stats.bulk_emails}
            </div>
            <div className="stat-label">Total Emails</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <label htmlFor="type-filter">Filter by Type:</label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="single">Single Emails</option>
            <option value="bulk">Bulk Emails</option>
          </select>
        </div>
        <div className="results-info">
          Showing {history.length} of {totalCount} emails
        </div>
      </div>

      {/* History Table */}
      <div className="history-table-container">
        {loading ? (
          <div className="loading-state">Loading email history...</div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <p>No email history found.</p>
            <p>Start sending emails to see them appear here!</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((email) => (
                <React.Fragment key={email.id}>
                  <tr className="history-row">
                    <td className="date-cell">{formatDate(email.sent_at)}</td>
                    <td className="type-cell">
                      {getTypeBadge(email.email_type)}
                    </td>
                    <td className="recipient-cell">
                      <div className="recipient-info">
                        <div className="recipient-email">
                          {email.recipient_email}
                        </div>
                        {email.recipient_name && (
                          <div className="recipient-name">
                            {email.recipient_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="subject-cell">
                      <div className="subject-text" title={email.subject}>
                        {email.subject.length > 50
                          ? email.subject.substring(0, 50) + "..."
                          : email.subject}
                      </div>
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(email.status)}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => toggleRowExpansion(email.id)}
                        className="expand-btn"
                      >
                        {expandedRows.has(email.id) ? "▼ Less" : "▶ More"}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(email.id) && (
                    <tr className="expanded-row">
                      <td colSpan={6}>
                        <div className="expanded-content">
                          <div className="expanded-section">
                            <h4>Email Content:</h4>
                            <div className="email-body">
                              {email.body.length > 500
                                ? email.body.substring(0, 500) + "..."
                                : email.body}
                            </div>
                          </div>
                          {email.status === "failed" && email.error_message && (
                            <div className="expanded-section error-section">
                              <h4>Error Details:</h4>
                              <div className="error-message">
                                {email.error_message}
                              </div>
                            </div>
                          )}
                          {email.batch_id && (
                            <div className="expanded-section">
                              <h4>Batch Information:</h4>
                              <div className="batch-id">
                                Batch ID: {email.batch_id}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailHistoryComponent;

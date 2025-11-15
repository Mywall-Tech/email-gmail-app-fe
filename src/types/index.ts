export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface GmailStatus {
  connected: boolean;
  expires_at?: string;
  expired?: boolean;
  scope?: string;
  message?: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface BulkEmailRecord {
  email: string;
  name: string;
}

export interface ProcessCSVResponse {
  total_records: number;
  valid_emails: BulkEmailRecord[];
  errors?: string[];
}

export interface BulkEmailRequest {
  subject: string;
  body: string;
  emails: BulkEmailRecord[];
}

export interface BulkEmailResult {
  email: string;
  success: boolean;
  error?: string;
}

export interface BulkEmailResponse {
  total_emails: number;
  success_count: number;
  failure_count: number;
  results: BulkEmailResult[];
  processing_time: string;
}

export interface EmailHistory {
  id: number;
  user_id: number;
  email_type: "single" | "bulk";
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  error_message: string;
  batch_id: string;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface EmailHistoryResponse {
  history: EmailHistory[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EmailHistoryStats {
  total_sent: number;
  total_failed: number;
  single_emails: number;
  bulk_emails: number;
  last_7_days_sent: number;
  last_7_days_failed: number;
}

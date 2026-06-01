export type RequestStatus =
  | "draft"
  | "ready_to_submit"
  | "submitted"
  | "records_received"
  | "closed";
// NOTE: "overdue" is not a manual status — it is calculated from deadline
// dates and surfaced via the is_overdue flag on IPRARequest.

export type SubmissionMethod =
  | "email"
  | "online_portal"
  | "mail"
  | "phone"
  | "in_person"
  | "other";

export interface Agency {
  id: string;
  name: string;
  agency_type: string | null;
  city: string | null;
  state: string | null;
  website_url: string | null;
  nextrequest_url: string | null;
  ipra_email: string | null;
  phone: string | null;
  fax: string | null;
  notes: string | null;
}

export interface IPRARequest {
  id: string;
  user_id: string;
  title: string;
  agency_id: string | null;
  agency_name: string;
  agency_email: string | null;
  description: string;
  request_text: string;
  status: RequestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  submitted_date: string | null;
  agency_received_date: string | null;
  request_identifier: string | null;
  submission_method: string | null;
  submission_url: string | null;
  submission_notes: string | null;
  three_day_deadline: string | null;
  fifteen_day_deadline: string | null;
  is_overdue: boolean;
}

export interface DeadlineInfo {
  request_id: string;
  submitted_date: string | null;
  three_business_day_deadline: string | null;
  fifteen_calendar_day_deadline: string | null;
  three_day_status: "not_set" | "pending" | "approaching" | "due_today" | "passed";
  fifteen_day_status: "not_set" | "pending" | "approaching" | "due_today" | "passed";
  days_until_three_day: number | null;
  days_until_fifteen_day: number | null;
}

export interface ImproveResponse {
  success: boolean;
  original_text: string;
  improved_text: string;
  suggestions: string[];
  is_demo: boolean;
  disclaimer: string;
}

export interface UploadedDocument {
  id: string;
  request_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  summary: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface DashboardStats {
  total: number;
  draft: number;
  readyToSubmit: number;
  submitted: number;
  recordsReceived: number;
  overdue: number;
}

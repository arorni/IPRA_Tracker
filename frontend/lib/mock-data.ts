/**
 * Frontend mock data for Phase 1 development.
 * FOR TESTING ONLY — SYNTHETIC SAMPLE DATA.
 * TODO Phase 2: Replace with real API calls.
 */

import type { IPRARequest, UploadedDocument } from "@/types";

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

export const MOCK_AGENCIES = [
  "New Mexico Department of Sample Services",
  "City of Demo Records Office",
  "Sample County Clerk's Office",
];

export const MOCK_DOCUMENTS: UploadedDocument[] = [
  {
    id: "doc-001",
    request_id: "req-004",
    file_name: "public_works_roster_FOR_TESTING_ONLY.pdf",
    file_size: 48200,
    file_type: "application/pdf",
    uploaded_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    summary: "FOR TESTING ONLY — SYNTHETIC SAMPLE RECORD.",
  },
  {
    id: "doc-002",
    request_id: "req-001",
    file_name: "budget_summary_fy2024_FOR_TESTING_ONLY.pdf",
    file_size: 125000,
    file_type: "application/pdf",
    uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    summary: null,
  },
];

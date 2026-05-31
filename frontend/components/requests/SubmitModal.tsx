"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { requestsApi } from "@/lib/api";
import type { IPRARequest, SubmissionMethod } from "@/types";

interface Props {
  request: IPRARequest;
  onClose: () => void;
  onSuccess: (updated: IPRARequest) => void;
}

const METHODS: { value: SubmissionMethod; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "online_portal", label: "Online Portal" },
  { value: "mail", label: "Mail" },
  { value: "phone", label: "Phone" },
  { value: "in_person", label: "In Person" },
  { value: "other", label: "Other" },
];

// For these methods the agency receives the request immediately — auto-populate received date
const INSTANT_RECEIVE_METHODS: SubmissionMethod[] = [
  "email", "online_portal", "phone", "in_person", "other",
];

export default function SubmitModal({ request, onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [method, setMethod] = useState<SubmissionMethod>("email");
  const [submittedDate, setSubmittedDate] = useState(today);
  const [agencyReceivedDate, setAgencyReceivedDate] = useState(today);
  const [requestIdentifier, setRequestIdentifier] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isInstantReceive = INSTANT_RECEIVE_METHODS.includes(method);

  const handleMethodChange = (m: SubmissionMethod) => {
    setMethod(m);
    if (INSTANT_RECEIVE_METHODS.includes(m)) {
      setAgencyReceivedDate(submittedDate);
    } else {
      setAgencyReceivedDate("");
    }
  };

  const handleSubmittedDateChange = (date: string) => {
    setSubmittedDate(date);
    if (isInstantReceive) {
      setAgencyReceivedDate(date);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await requestsApi.markSubmitted(request.id, {
        submission_method: method,
        submitted_date: submittedDate,
        request_identifier: requestIdentifier || undefined,
        agency_received_date: agencyReceivedDate || undefined,
        submission_notes: notes || undefined,
      });
      onSuccess(data);
    } catch {
      setError("Failed to mark request as submitted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Confirm Submission</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xs">{request.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Submission Method */}
          <div>
            <label className="label">Submission Method</label>
            <div className="grid grid-cols-2 gap-2 mt-1 sm:grid-cols-3">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMethodChange(m.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left font-medium ${
                    method === m.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submission Date */}
          <div>
            <label className="label">Submission Date</label>
            <input
              type="date"
              value={submittedDate}
              max={today}
              onChange={(e) => handleSubmittedDateChange(e.target.value)}
              className="input"
            />
          </div>

          {/* Request Identifier */}
          <div>
            <label className="label">
              Request Identifier{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={requestIdentifier}
              onChange={(e) => setRequestIdentifier(e.target.value)}
              placeholder="e.g. portal confirmation number, email thread ID"
              className="input"
            />
          </div>

          {/* Agency Received Date */}
          <div>
            <label className="label">
              Agency Received Date{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={agencyReceivedDate}
              max={today}
              onChange={(e) => setAgencyReceivedDate(e.target.value)}
              className="input"
            />
            {method === "mail" ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-1.5">
                For mailed requests, the agency received date may differ from the submission date. Record it when known.
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1.5">
                Auto-populated from submission date. Edit if the agency acknowledged receipt on a different date.
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='e.g. "Submitted to records@agency.gov"'
              className="input"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !submittedDate}
            className="btn-primary"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  );
}

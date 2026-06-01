"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Trash2, Send, Clock,
  Calendar, CheckCircle, FileText, Copy, Mail, X, ChevronDown,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import SubmitModal from "@/components/requests/SubmitModal";
import Toast from "@/components/ui/Toast";
import { requestsApi } from "@/lib/api";
import type { IPRARequest } from "@/types";
import { formatDeadlineDate, getDeadlineUrgency, urgencyLabel, urgencyColor } from "@/lib/deadline-utils";
import { format } from "date-fns";
import clsx from "clsx";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<IPRARequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showReceiptPanel, setShowReceiptPanel] = useState(false);
  const [receiptDate, setReceiptDate] = useState("");
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    requestsApi.get(id)
      .then(({ data }) => setRequest(data))
      .catch(() => setToast({ msg: "Failed to load request.", type: "error" }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await requestsApi.delete(id);
      router.push("/requests");
    } catch {
      setToast({ msg: "Failed to delete request.", type: "error" });
    }
  };

  const handleMarkRecordsReceived = async () => {
    try {
      const { data } = await requestsApi.update(id, { status: "records_received" });
      setRequest(data);
      setToast({ msg: "Request marked as records received.", type: "success" });
    } catch {
      setToast({ msg: "Failed to update status.", type: "error" });
    }
  };

  const handleMarkClosed = async () => {
    try {
      const { data } = await requestsApi.update(id, { status: "closed" });
      setRequest(data);
      setToast({ msg: "Request closed.", type: "success" });
    } catch {
      setToast({ msg: "Failed to update status.", type: "error" });
    }
  };

  const handleSubmitSuccess = (updated: IPRARequest) => {
    setRequest(updated);
    setShowSubmitModal(false);
    setToast({ msg: "Request marked as submitted. Deadline tracking has started.", type: "success" });
  };

  const handleMarkReceived = async () => {
    if (!receiptDate) return;
    setReceiptLoading(true);
    try {
      const { data } = await requestsApi.markReceived(id, { agency_received_date: receiptDate });
      setRequest(data);
      setShowReceiptPanel(false);
      setReceiptDate("");
      setToast({ msg: "Agency receipt recorded. Deadline tracking is now active.", type: "success" });
    } catch {
      setToast({ msg: "Failed to record agency receipt. Please try again.", type: "error" });
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleCopyRequest = async () => {
    if (!request) return;
    await navigator.clipboard.writeText(request.request_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-base font-medium text-slate-700 mb-1">Request not found</p>
          <Link href="/requests" className="btn-secondary mt-3">Back to Requests</Link>
        </div>
      </AppLayout>
    );
  }

  const u3 = getDeadlineUrgency(request.three_day_deadline);
  const u15 = getDeadlineUrgency(request.fifteen_day_deadline);
  const isReadyToSubmit = request.status === "ready_to_submit";
  const isSubmitted = request.status === "submitted";
  const isRecordsReceived = request.status === "records_received";
  const needsReceiptDate = isSubmitted && !request.agency_received_date;

  const emailSubject = `IPRA Request: ${request.title}`;
  const emailBody = `${request.request_text}`;

  return (
    <AppLayout>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back + Actions */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <Link href="/requests" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> All Requests
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {isReadyToSubmit && (
            <>
              <button
                onClick={handleCopyRequest}
                className="btn-secondary"
                title="Copy request text to clipboard"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Request"}
              </button>
              <button
                onClick={() => setShowEmailPreview(true)}
                className="btn-secondary"
              >
                <Mail className="w-4 h-4" /> Preview Email
              </button>
              <button onClick={() => setShowSubmitModal(true)} className="btn-primary">
                <Send className="w-4 h-4" /> Mark as Submitted
              </button>
            </>
          )}

          {isRecordsReceived && (
            <button onClick={handleMarkClosed} className="btn-secondary">
              <CheckCircle className="w-4 h-4" /> Close Request
            </button>
          )}

          {isSubmitted ? (
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown((v) => !v)}
                className="btn-secondary"
              >
                <ChevronDown className="w-4 h-4" /> Change Request Status
              </button>
              {showStatusDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                      Change Status To
                    </p>
                    <button
                      onClick={() => { handleMarkRecordsReceived(); setShowStatusDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Records Received
                    </button>
                    <button
                      onClick={() => { handleMarkClosed(); setShowStatusDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                      Closed
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href={`/requests/${id}/edit`} className="btn-secondary">
              <Edit2 className="w-4 h-4" /> Edit
            </Link>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-secondary text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ready-to-submit guidance banner */}
      {isReadyToSubmit && (
        <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Send className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800">
            This request is ready to send. Submit it to the agency via email, online portal, or mail — then return here and click <strong>Mark as Submitted</strong> to start deadline tracking.
          </p>
        </div>
      )}

      {/* Submitted — awaiting agency response */}
      {isSubmitted && (
        <div className="mb-4 flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-sm text-indigo-800">
            Awaiting agency response. Deadlines are tracked from the <strong>agency received date</strong>. Once records arrive, click <strong>Mark Records Received</strong>.
          </p>
        </div>
      )}

      {/* Record Agency Receipt panel */}
      {needsReceiptDate && (
        <div className="mb-6 border border-amber-200 bg-amber-50 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-amber-900">Record Agency Receipt</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Enter the date the agency received your request to begin deadline tracking.
                Deadlines begin from the agency received date, not the submission date.
              </p>
            </div>
            {!showReceiptPanel && (
              <button
                onClick={() => {
                  setReceiptDate(request.submitted_date ?? today);
                  setShowReceiptPanel(true);
                }}
                className="btn-primary text-xs px-3 py-1.5 shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" /> Record Receipt Date
              </button>
            )}
          </div>

          {showReceiptPanel && (
            <div className="mt-4 pt-4 border-t border-amber-200 flex items-end gap-3 flex-wrap">
              <div>
                <label className="label text-xs mb-1">Date Agency Received Request</label>
                <input
                  type="date"
                  value={receiptDate}
                  max={today}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="input text-sm"
                />
              </div>
              <button
                onClick={handleMarkReceived}
                disabled={!receiptDate || receiptLoading}
                className="btn-primary text-xs px-3 py-1.5"
              >
                {receiptLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Confirm
              </button>
              <button
                onClick={() => setShowReceiptPanel(false)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Title + Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title">{request.title}</h1>
          <StatusBadge status={request.status} isOverdue={request.is_overdue} />
        </div>
        <p className="text-sm text-slate-500 mt-1">{request.agency_name}</p>
        {request.agency_email && (
          <p className="text-xs text-slate-400 mt-0.5">{request.agency_email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Text */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h2 className="section-title mb-4">Request Text</h2>
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
              {request.request_text}
            </pre>
          </div>

          {request.description && (
            <div className="card p-6">
              <h2 className="section-title mb-2">Description</h2>
              <p className="text-sm text-slate-600">{request.description}</p>
            </div>
          )}

          {request.notes && (
            <div className="card p-6">
              <h2 className="section-title mb-2">Internal Notes</h2>
              <p className="text-sm text-slate-600">{request.notes}</p>
            </div>
          )}

          {request.submitted_date && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Submission Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Submitted</p>
                  <p className="text-slate-800 mt-0.5">{format(new Date(request.submitted_date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Method</p>
                  <p className="text-slate-800 mt-0.5 capitalize">
                    {request.submission_method?.replace("_", " ")}
                  </p>
                </div>
                {request.agency_received_date && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Agency Received</p>
                    <p className="text-slate-800 mt-0.5">{format(new Date(request.agency_received_date), "MMMM d, yyyy")}</p>
                  </div>
                )}
                {request.request_identifier && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Tracking / Ref #</p>
                    <p className="text-slate-800 mt-0.5 font-mono text-xs">{request.request_identifier}</p>
                  </div>
                )}
                {request.submission_notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Notes</p>
                    <p className="text-slate-800 mt-0.5">{request.submission_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Deadlines */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Deadline Tracking
            </h3>
            {!request.three_day_deadline ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400">
                  Deadlines begin from the agency received date.
                  {needsReceiptDate
                    ? " Record the receipt date above to start tracking."
                    : " Mark as submitted and record receipt to begin."}
                </p>
                {isReadyToSubmit && (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="btn-primary mt-3 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Mark as Submitted
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className={clsx("border rounded-lg px-3 py-2.5", urgencyColor(u3))}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">3-Business-Day Response</p>
                      <p className="text-xs mt-0.5 opacity-75">Agency written response</p>
                    </div>
                    <span className="text-xs font-medium">{urgencyLabel(u3)}</span>
                  </div>
                  <p className="text-xs font-bold mt-1.5">{formatDeadlineDate(request.three_day_deadline)}</p>
                </div>

                <div className={clsx("border rounded-lg px-3 py-2.5", urgencyColor(u15))}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">15-Calendar-Day Production</p>
                      <p className="text-xs mt-0.5 opacity-75">Records due</p>
                    </div>
                    <span className="text-xs font-medium">{urgencyLabel(u15)}</span>
                  </div>
                  <p className="text-xs font-bold mt-1.5">{formatDeadlineDate(request.fifteen_day_deadline)}</p>
                </div>

                <p className="text-xs text-slate-400 pt-1">
                  Deadlines begin from the agency received date.
                  Holidays are not currently factored into calculations.
                  {/* TODO: Add holiday support in Phase 2+ */}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="card p-5 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Created</p>
              <p className="text-slate-700 mt-0.5">{format(new Date(request.created_at), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Last Updated</p>
              <p className="text-slate-700 mt-0.5">{format(new Date(request.updated_at), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Request ID</p>
              <p className="text-slate-500 mt-0.5 font-mono text-xs">{request.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Actions</h3>
            {isSubmitted ? (
              <>
                {needsReceiptDate && (
                  <button
                    onClick={() => {
                      setReceiptDate(request.submitted_date ?? today);
                      setShowReceiptPanel(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn-secondary w-full justify-center text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    <Calendar className="w-4 h-4" /> Record Agency Receipt
                  </button>
                )}
                <button
                  onClick={handleMarkRecordsReceived}
                  className="btn-secondary w-full justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" /> Records Received
                </button>
                <button
                  onClick={handleMarkClosed}
                  className="btn-secondary w-full justify-center"
                >
                  <X className="w-4 h-4" /> Close Request
                </button>
              </>
            ) : (
              <Link href={`/requests/${id}/edit`} className="btn-secondary w-full justify-center">
                <Edit2 className="w-4 h-4" /> Edit Request
              </Link>
            )}
            <Link href="/deadlines" className="btn-secondary w-full justify-center">
              <Calendar className="w-4 h-4" /> View All Deadlines
            </Link>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitModal
          request={request}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmailPreview(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Email Preview</h2>
                <p className="text-sm text-slate-500 mt-0.5">Draft email to send to the agency</p>
              </div>
              <button onClick={() => setShowEmailPreview(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2 border border-slate-100">
                <div className="flex gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-12 shrink-0 mt-0.5">To:</span>
                  <span className="text-slate-700">{request.agency_email || "records@agency.gov"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-12 shrink-0 mt-0.5">Subject:</span>
                  <span className="text-slate-700">{emailSubject}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-2">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {emailBody}
                  </pre>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Copy this text and send it to the agency manually. After sending, return here and click <strong>Mark as Submitted</strong>.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setShowEmailPreview(false)} className="btn-secondary">
                Close
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`To: ${request.agency_email || ""}\nSubject: ${emailSubject}\n\n${emailBody}`);
                  setShowEmailPreview(false);
                  setToast({ msg: "Email draft copied to clipboard.", type: "success" });
                }}
                className="btn-primary"
              >
                <Copy className="w-4 h-4" /> Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Delete Request?</h2>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete &quot;{request.title}&quot;. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

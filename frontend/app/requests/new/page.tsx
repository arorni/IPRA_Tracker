"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Info, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { requestsApi, aiApi } from "@/lib/api";
import { MOCK_AGENCIES } from "@/lib/mock-data";

const IPRA_TEMPLATE = `Pursuant to the New Mexico Inspection of Public Records Act (NMSA 1978, § 14-2-1 et seq.), I request copies of the following public records:

[Describe the specific records you are requesting. Include relevant date ranges, department names, document types, and any other identifying details.]

Please provide the records in electronic format where possible. If any portion of this request is denied, please specify the legal basis for each denial and identify the specific exemption relied upon.`;

type AiState =
  | { stage: "idle" }
  | { stage: "loading" }
  | { stage: "review"; improvedText: string; suggestions: string[]; isDemo: boolean }
  | { stage: "accepted" };

export default function NewRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [description, setDescription] = useState("");
  const [requestText, setRequestText] = useState(IPRA_TEMPLATE);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiState, setAiState] = useState<AiState>({ stage: "idle" });
  const [error, setError] = useState("");
  const [readyBanner, setReadyBanner] = useState(false);

  const handleAiImprove = async () => {
    if (!requestText.trim()) return;
    setAiState({ stage: "loading" });
    try {
      const { data } = await aiApi.improveRequest(requestText, agencyName || "the agency");
      setAiState({
        stage: "review",
        improvedText: data.improved_text || requestText,
        suggestions: data.suggestions ?? [],
        isDemo: data.is_demo ?? false,
      });
    } catch {
      setAiState({
        stage: "review",
        improvedText: requestText,
        suggestions: [
          "Specify a date range for the records you are requesting.",
          "Name the specific record type (emails, contracts, reports, etc.).",
          "Reference the relevant department or program name.",
          "Keep the request focused on one topic for faster response.",
        ],
        isDemo: true,
      });
    }
  };

  const acceptAi = () => {
    if (aiState.stage !== "review") return;
    setRequestText(aiState.improvedText);
    setAiState({ stage: "accepted" });
  };

  const keepOriginal = () => setAiState({ stage: "idle" });

  const editManually = () => {
    if (aiState.stage !== "review") return;
    setRequestText(aiState.improvedText);
    setAiState({ stage: "idle" });
  };

  const handleSave = async (status: "draft" | "ready_to_submit" = "draft") => {
    setError("");
    if (!title.trim() || !agencyName.trim() || !requestText.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await requestsApi.create({
        title,
        agency_name: agencyName,
        agency_email: agencyEmail || undefined,
        description,
        request_text: requestText,
        notes: notes || undefined,
      });
      if (status === "ready_to_submit") {
        await requestsApi.update(data.id, { status: "ready_to_submit" });
        setReadyBanner(true);
        setTimeout(() => router.push(`/requests/${data.id}`), 1800);
      } else {
        router.push(`/requests/${data.id}`);
      }
    } catch {
      setError("Failed to save request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/requests" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Requests
        </Link>
        <h1 className="page-title">New IPRA Request</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Draft your New Mexico public records request
        </p>
      </div>

      {readyBanner && (
        <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-800">
            <strong>Request marked as ready.</strong> Submit it using the agency's preferred method (email, portal, or mail), then return here to mark it as submitted and start deadline tracking.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <div>
              <label className="label">Request Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Budget Reports FY2024"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Agency Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  list="agencies"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Enter agency name"
                  className="input"
                />
                <datalist id="agencies">
                  {MOCK_AGENCIES.map((a) => <option key={a} value={a} />)}
                </datalist>
              </div>
              <div>
                <label className="label">Agency Email <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  placeholder="records@agency.gov"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Brief Description <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One-line summary for your reference"
                className="input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Request Text <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={handleAiImprove}
                  disabled={aiState.stage === "loading" || !requestText.trim()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  {aiState.stage === "loading" ? (
                    <span className="w-3 h-3 border border-brand-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {aiState.stage === "loading" ? "Improving..." : "AI Improve"}
                </button>
              </div>
              <textarea
                required
                rows={10}
                value={requestText}
                onChange={(e) => {
                  setRequestText(e.target.value);
                  if (aiState.stage === "accepted") setAiState({ stage: "idle" });
                }}
                className="input font-mono text-xs leading-relaxed resize-y"
              />
            </div>

            {/* AI Review Panel */}
            {aiState.stage === "review" && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-brand-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-800">
                    <Sparkles className="w-4 h-4" />
                    AI Suggested Version
                    {aiState.isDemo && (
                      <span className="text-xs font-normal text-brand-500 bg-brand-100 px-2 py-0.5 rounded-full">Demo mode</span>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <pre className="text-xs text-brand-900 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-brand-100 max-h-48 overflow-y-auto">
                    {aiState.improvedText}
                  </pre>
                  {aiState.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-brand-700 mb-1">Suggestions applied:</p>
                      <ul className="space-y-0.5">
                        {aiState.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-brand-700 flex gap-2">
                            <span className="text-brand-400">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={acceptAi}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept AI Version
                    </button>
                    <button
                      type="button"
                      onClick={editManually}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Edit Manually
                    </button>
                    <button
                      type="button"
                      onClick={keepOriginal}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2"
                    >
                      Keep Original
                    </button>
                  </div>
                </div>
              </div>
            )}

            {aiState.stage === "accepted" && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <CheckCircle className="w-3.5 h-3.5" /> AI version accepted and applied to request text.
              </div>
            )}

            <div>
              <label className="label">Internal Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="For your reference only — not sent to the agency"
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={loading}
                className="btn-secondary"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave("ready_to_submit")}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Mark as Ready
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-800">IPRA Deadline Rules</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                If records are not provided within <strong>3 business days</strong>, the agency must provide a written explanation of when records will be available.
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">15</span>
                Records must be made available no later than <strong>15 calendar days</strong> after receipt.
              </li>
            </ul>
            <p className="text-xs text-slate-400 mt-4">
              This tool does not provide legal advice.
            </p>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Workflow</h3>
            <ol className="space-y-2 text-xs text-slate-500">
              {[
                "Draft your request",
                "Use AI Improve to refine wording",
                "Review and accept or edit the suggestion",
                "Click Mark as Ready when finalized",
                "Submit outside the app (email, portal, mail)",
                "Return here and click Mark as Submitted",
                "Deadlines begin tracking automatically",
              ].map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-500 font-semibold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

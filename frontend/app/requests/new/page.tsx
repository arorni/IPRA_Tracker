"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Info, CheckCircle, RefreshCw } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import AgencyCombobox from "@/components/ui/AgencyCombobox";
import { requestsApi, aiApi } from "@/lib/api";
import type { Agency } from "@/types";

const IPRA_TEMPLATE = `Pursuant to the New Mexico Inspection of Public Records Act (NMSA 1978, § 14-2-1 et seq.), I request copies of the following public records:

[Describe the specific records you are requesting. Include relevant date ranges, department names, document types, and any other identifying details.]

Please provide the records in electronic format where possible. If any portion of this request is denied, please specify the legal basis for each denial and identify the specific exemption relied upon.`;

type AiState =
  | { stage: "idle" }
  | { stage: "loading" }
  | {
      stage: "review";
      originalText: string;
      success: boolean;
      improvedText: string;
      suggestions: string[];
      disclaimer: string;
      isDemo: boolean;
    }
  | { stage: "http_error"; message: string }
  | { stage: "accepted" };

export default function NewRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [agencyInputValue, setAgencyInputValue] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [description, setDescription] = useState("");
  const [requestText, setRequestText] = useState(IPRA_TEMPLATE);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiState, setAiState] = useState<AiState>({ stage: "idle" });
  const [error, setError] = useState("");
  const [readyBanner, setReadyBanner] = useState(false);

  const handleAgencySelect = (agency: Agency | null) => {
    setSelectedAgency(agency);
    if (agency?.ipra_email) setAgencyEmail(agency.ipra_email);
  };

  const handleAiImprove = async () => {
    if (!requestText.trim()) return;
    setAiState({ stage: "loading" });
    try {
      const { data } = await aiApi.improveRequest(
        requestText,
        agencyInputValue || "the agency"
      );
      setAiState({
        stage: "review",
        originalText: requestText,
        success: data.success,
        improvedText: data.improved_text ?? requestText,
        suggestions: data.suggestions ?? [],
        disclaimer: data.disclaimer ?? "",
        isDemo: data.is_demo ?? false,
      });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        setAiState({ stage: "http_error", message: "Daily AI Improve limit reached. Please try again tomorrow." });
      } else if (status === 401) {
        setAiState({ stage: "http_error", message: "Please log in again before using AI Improve." });
      } else {
        setAiState({
          stage: "review",
          originalText: requestText,
          success: false,
          improvedText: requestText,
          suggestions: ["AI Improve is unavailable right now. Please try again later."],
          disclaimer: "",
          isDemo: false,
        });
      }
    }
  };

  const acceptSuggestion = () => {
    if (aiState.stage !== "review" || !aiState.success) return;
    setRequestText(aiState.improvedText);
    setAiState({ stage: "accepted" });
  };

  const keepOriginal = () => setAiState({ stage: "idle" });

  const handleSave = async (status: "draft" | "ready_to_submit" = "draft") => {
    setError("");
    if (!title.trim() || !agencyInputValue.trim() || !requestText.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await requestsApi.create({
        title,
        agency_name: agencyInputValue,
        agency_email: agencyEmail.trim() || undefined,
        agency_id: selectedAgency?.id || undefined,
        submission_url: selectedAgency?.nextrequest_url || undefined,
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

            <div>
              <label className="label">Agency <span className="text-red-500">*</span></label>
              <AgencyCombobox
                selectedAgency={selectedAgency}
                onSelect={handleAgencySelect}
                inputValue={agencyInputValue}
                onInputChange={setAgencyInputValue}
                required
              />
            </div>

            <div>
              <label className="label">
                Agency IPRA Email{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={agencyEmail}
                onChange={(e) => setAgencyEmail(e.target.value)}
                placeholder="records@agency.gov"
                className="input"
              />
              {selectedAgency?.ipra_email && (
                <p className="text-xs text-slate-400 mt-1">
                  Auto-filled from agency directory — update if different.
                </p>
              )}
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

            {/* AI Panel — http_error */}
            {aiState.stage === "http_error" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">AI Improve</span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <p className="text-sm text-amber-800">{aiState.message}</p>
                  <button
                    type="button"
                    onClick={keepOriginal}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* AI Panel — review */}
            {aiState.stage === "review" && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-100">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-brand-800">AI Improve</span>
                  {aiState.isDemo && (
                    <span className="text-xs font-normal text-brand-500 bg-brand-100 px-2 py-0.5 rounded-full">Demo mode</span>
                  )}
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Your Original Request</p>
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-slate-200 max-h-32 overflow-y-auto">
                      {aiState.originalText}
                    </pre>
                  </div>

                  {aiState.success && (
                    <div>
                      <p className="text-xs font-semibold text-brand-700 mb-1">AI Suggested Version</p>
                      <pre className="text-xs text-brand-900 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-brand-100 max-h-48 overflow-y-auto">
                        {aiState.improvedText}
                      </pre>
                    </div>
                  )}

                  {aiState.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-brand-700 mb-1">
                        {aiState.success ? "Suggestions:" : "Note:"}
                      </p>
                      <ul className="space-y-0.5">
                        {aiState.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-brand-700 flex gap-2">
                            <span className="text-brand-400">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiState.disclaimer && (
                    <p className="text-xs text-slate-400 italic">{aiState.disclaimer}</p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {aiState.success && (
                      <button
                        type="button"
                        onClick={acceptSuggestion}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept Suggestion
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAiImprove}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
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
                <CheckCircle className="w-3.5 h-3.5" /> AI suggestion accepted and applied to request text.
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
                Records must be made available no later than <strong>15 calendar days</strong> after the agency receives your request.
              </li>
            </ul>
            <p className="text-xs text-slate-400 mt-4">
              Deadlines begin from the agency received date. This tool does not provide legal advice.
            </p>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Workflow</h3>
            <ol className="space-y-2 text-xs text-slate-500">
              {[
                "Draft your request",
                "Use AI Improve to refine wording",
                "Review and accept or keep original",
                "Click Mark as Ready when finalized",
                "Submit outside the app (email, portal, mail)",
                "Return here and click Mark as Submitted",
                "Record the agency received date",
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

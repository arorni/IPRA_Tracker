"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { requestsApi, aiApi } from "@/lib/api";
import type { IPRARequest } from "@/types";
import { MOCK_AGENCIES } from "@/lib/mock-data";

type AiState =
  | { stage: "idle" }
  | { stage: "loading" }
  | { stage: "review"; improvedText: string; suggestions: string[]; isDemo: boolean }
  | { stage: "accepted" };

export default function EditRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<IPRARequest | null>(null);
  const [title, setTitle] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [description, setDescription] = useState("");
  const [requestText, setRequestText] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiState, setAiState] = useState<AiState>({ stage: "idle" });
  const [readyBanner, setReadyBanner] = useState(false);

  useEffect(() => {
    requestsApi.get(id)
      .then(({ data }) => {
        setRequest(data);
        setTitle(data.title);
        setAgencyName(data.agency_name);
        setAgencyEmail(data.agency_email ?? "");
        setDescription(data.description);
        setRequestText(data.request_text);
        setNotes(data.notes ?? "");
      })
      .catch(() => setError("Failed to load request."))
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleSave = async (e: FormEvent, markReady = false) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !agencyName.trim() || !requestText.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const updates: Parameters<typeof requestsApi.update>[1] = {
        title,
        agency_name: agencyName,
        agency_email: agencyEmail || undefined,
        description,
        request_text: requestText,
        notes: notes || undefined,
      };
      if (markReady) updates.status = "ready_to_submit";
      await requestsApi.update(id, updates);
      if (markReady) {
        setReadyBanner(true);
        setTimeout(() => router.push(`/requests/${id}`), 1800);
      } else {
        router.push(`/requests/${id}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(msg ?? "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
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

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href={`/requests/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Request
        </Link>
        <h1 className="page-title">Edit Request</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Previous versions are saved automatically for your audit trail.
        </p>
      </div>

      {readyBanner && (
        <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-800">
            <strong>Request marked as ready.</strong> Submit it using the agency's preferred method, then return here to mark it as submitted.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSave(e)} className="card p-6 space-y-5 max-w-2xl">
        <div>
          <label className="label">Request Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              className="input"
            />
            <datalist id="agencies">
              {MOCK_AGENCIES.map((a) => <option key={a} value={a} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Agency Email</label>
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
          <label className="label">Brief Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                  <p className="text-xs font-semibold text-brand-700 mb-1">Suggestions:</p>
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
                <button type="button" onClick={acceptAi} className="btn-primary text-xs px-3 py-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Accept AI Version
                </button>
                <button type="button" onClick={editManually} className="btn-secondary text-xs px-3 py-1.5">
                  Edit Manually
                </button>
                <button type="button" onClick={keepOriginal} className="text-xs text-slate-500 hover:text-slate-700 px-2">
                  Keep Original
                </button>
              </div>
            </div>
          </div>
        )}

        {aiState.stage === "accepted" && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5" /> AI version accepted and applied.
          </div>
        )}

        <div>
          <label className="label">Internal Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link href={`/requests/${id}`} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-secondary">
            {saving ? (
              <span className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          {request?.status !== "submitted" && request?.status !== "records_received" && request?.status !== "closed" && (
            <button
              type="button"
              onClick={(e) => handleSave(e as unknown as FormEvent, true)}
              disabled={saving}
              className="btn-primary"
            >
              Mark as Ready
            </button>
          )}
        </div>
      </form>
    </AppLayout>
  );
}

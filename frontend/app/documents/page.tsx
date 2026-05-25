"use client";

import { Upload, Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

export default function DocumentsPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="page-title">Documents</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload and manage returned public records
        </p>
      </div>

      {/* Availability note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Documents become available after a request is marked as submitted and records are received from the agency.
        </p>
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Upload className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 mb-2">
          Document Upload — Coming in Phase 4
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-2">
          Once records are received, you'll be able to upload, store, and AI-summarize returned documents here.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl w-full">
          {[
            { phase: "Phase 4", label: "Upload Documents", desc: "Attach returned records to requests" },
            { phase: "Phase 4", label: "AI Summarization", desc: "Automatically summarize uploaded files" },
            { phase: "Phase 5", label: "Follow-up Suggestions", desc: "AI suggests next IPRA requests" },
          ].map(({ phase, label, desc }) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-medium text-brand-600">{phase}</span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

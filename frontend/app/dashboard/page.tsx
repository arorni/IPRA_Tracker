"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Clock, AlertTriangle, CheckCircle,
  Plus, Upload, TrendingUp, Inbox, ClipboardList,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { requestsApi, documentsApi } from "@/lib/api";
import type { IPRARequest, UploadedDocument } from "@/types";
import { formatDeadlineDate, getDeadlineUrgency } from "@/lib/deadline-utils";
import clsx from "clsx";

export default function DashboardPage() {
  const [requests, setRequests] = useState<IPRARequest[]>([]);
  const [recentDocs, setRecentDocs] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await requestsApi.list();
        setRequests(data);
        const docRequests = data.filter((r) =>
          ["submitted", "records_received"].includes(r.status)
        );
        const docsArr: UploadedDocument[] = [];
        for (const r of docRequests.slice(0, 3)) {
          try {
            const { data: docs } = await documentsApi.list(r.id);
            docsArr.push(...docs);
          } catch {
            // ignore per-request errors
          }
        }
        setRecentDocs(docsArr.slice(0, 5));
      } catch {
        // Backend not available — show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date();

  const stats = {
    total: requests.length,
    draft: requests.filter((r) => r.status === "draft").length,
    readyToSubmit: requests.filter((r) => r.status === "ready_to_submit").length,
    submitted: requests.filter((r) => r.status === "submitted").length,
    recordsReceived: requests.filter((r) => r.status === "records_received").length,
    overdue: requests.filter((r) => {
      if (r.status === "closed" || r.status === "records_received") return false;
      if (r.is_overdue) return true;
      if (r.fifteen_day_deadline) {
        return new Date(r.fifteen_day_deadline) < today;
      }
      return false;
    }).length,
  };

  const submittedRequests = requests
    .filter((r) => r.submitted_date && ["submitted", "records_received"].includes(r.status))
    .sort((a, b) => (a.fifteen_day_deadline ?? "").localeCompare(b.fifteen_day_deadline ?? ""))
    .slice(0, 5);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of your IPRA requests and deadlines
          </p>
        </div>
        <Link href="/requests/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Request
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Requests"
              value={stats.total}
              icon={TrendingUp}
              href="/requests"
            />
            <StatCard
              label="Drafts"
              value={stats.draft}
              icon={FileText}
              color="blue"
              href="/requests?status=draft"
            />
            <StatCard
              label="Ready to Submit"
              value={stats.readyToSubmit}
              icon={ClipboardList}
              color="purple"
              href="/requests?status=ready_to_submit"
            />
            <StatCard
              label="Submitted"
              value={stats.submitted}
              icon={CheckCircle}
              color="green"
              href="/requests?status=submitted"
            />
            <StatCard
              label="Records Received"
              value={stats.recordsReceived}
              icon={CheckCircle}
              color="green"
              href="/requests?status=records_received"
            />
            <StatCard
              label="Overdue"
              value={stats.overdue}
              icon={AlertTriangle}
              color="red"
              description="Past 15-day deadline"
              href="/deadlines"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Deadlines */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="section-title">Active Deadlines</h2>
                <Link href="/deadlines" className="text-xs text-brand-600 font-medium hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {submittedRequests.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-400">
                    No submitted requests yet.{" "}
                    <Link href="/requests/new" className="text-brand-600 font-medium hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  submittedRequests.map((r) => {
                    const u15 = getDeadlineUrgency(r.fifteen_day_deadline);
                    const isOverdue = r.is_overdue || u15 === "passed";
                    return (
                      <div key={r.id} className="px-5 py-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/requests/${r.id}`}
                            className="text-sm font-medium text-slate-800 hover:text-brand-600 truncate block"
                          >
                            {r.title}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">{r.agency_name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-slate-700">
                            {formatDeadlineDate(r.fifteen_day_deadline)}
                          </p>
                          <p className={clsx(
                            "text-xs mt-0.5",
                            isOverdue ? "text-red-600 font-medium" :
                            u15 === "approaching" || u15 === "due_today" ? "text-yellow-600" :
                            "text-slate-400"
                          )}>
                            {isOverdue ? "15-day overdue" : "15-day deadline"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Recent Requests */}
              <div className="card">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="section-title">Recent Requests</h2>
                  <Link href="/requests" className="text-xs text-brand-600 font-medium hover:underline">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {requests.slice(0, 4).map((r) => (
                    <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/requests/${r.id}`}
                          className="text-sm font-medium text-slate-800 hover:text-brand-600 truncate block"
                        >
                          {r.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{r.agency_name}</p>
                      </div>
                      <StatusBadge status={r.status} isOverdue={r.is_overdue} size="sm" />
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="px-5 py-6 text-center text-sm text-slate-400">
                      No requests yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Documents */}
              <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="section-title">Recent Documents</h2>
                </div>
                <div className="px-5 py-4">
                  {recentDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Upload className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Available after records are received (Phase 4).
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 py-1">
                          <Inbox className="w-4 h-4 text-slate-400 shrink-0" />
                          <p className="text-sm text-slate-700 truncate">{doc.file_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

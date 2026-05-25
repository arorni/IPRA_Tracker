"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { requestsApi } from "@/lib/api";
import type { IPRARequest } from "@/types";
import { format } from "date-fns";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all",              label: "All" },
  { value: "draft",            label: "Draft" },
  { value: "ready_to_submit",  label: "Ready to Submit" },
  { value: "submitted",        label: "Submitted" },
  { value: "records_received", label: "Records Received" },
  { value: "closed",           label: "Closed" },
  { value: "overdue",          label: "Overdue" },
];

function RequestsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "all";

  const [requests, setRequests] = useState<IPRARequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    setStatusFilter(searchParams.get("status") ?? "all");
  }, [searchParams]);

  useEffect(() => {
    requestsApi.list()
      .then(({ data }) => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter((r) => {
    let matchStatus: boolean;
    if (statusFilter === "all") {
      matchStatus = true;
    } else if (statusFilter === "overdue") {
      matchStatus = r.is_overdue === true;
    } else {
      matchStatus = r.status === statusFilter;
    }
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.agency_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeLabel = STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ?? "All";

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {requests.length} total request{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/requests/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === f.value
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter indicator */}
      {statusFilter !== "all" && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Filtering by:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100">
            {activeLabel}
            <button
              onClick={() => setStatusFilter("all")}
              className="ml-1 text-brand-400 hover:text-brand-700 leading-none"
              aria-label="Clear filter"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-base font-medium text-slate-700 mb-1">No requests found</p>
          <p className="text-sm text-slate-400 mb-4">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Create your first IPRA request to get started."}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/requests/new" className="btn-primary">
              <Plus className="w-4 h-4" /> New Request
            </Link>
          )}
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={`/requests/${r.id}`}
              className="flex items-start justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {r.title}
                  </p>
                  <StatusBadge status={r.status} isOverdue={r.is_overdue} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{r.agency_name}</p>
                {r.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{r.description}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-xs text-slate-400">
                  {format(new Date(r.created_at), "MMM d, yyyy")}
                </p>
                {r.fifteen_day_deadline && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due {format(new Date(r.fifteen_day_deadline), "MMM d")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsContent />
    </Suspense>
  );
}

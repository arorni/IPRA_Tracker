"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { requestsApi } from "@/lib/api";
import type { IPRARequest } from "@/types";
import {
  formatDeadlineDate, getDeadlineUrgency,
  urgencyColor, daysUntil,
} from "@/lib/deadline-utils";
import { format } from "date-fns";
import clsx from "clsx";
import Link from "next/link";

export default function DeadlinePage() {
  const [requests, setRequests] = useState<IPRARequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsApi.list()
      .then(({ data }) => {
        // Only show requests that have been submitted (have deadlines)
        const withDeadlines = data.filter(
          (r) => r.submitted_date && ["submitted", "records_received"].includes(r.status)
        );
        setRequests(withDeadlines);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Overdue: deadline has passed and records not yet received
  const overdue = requests.filter((r) => {
    if (r.status === "records_received") return false;
    return r.is_overdue || getDeadlineUrgency(r.fifteen_day_deadline) === "passed";
  });

  const upcoming = requests.filter(
    (r) =>
      !overdue.includes(r) &&
      (getDeadlineUrgency(r.fifteen_day_deadline) === "approaching" ||
        getDeadlineUrgency(r.fifteen_day_deadline) === "due_today")
  );

  const tracking = requests.filter(
    (r) => !overdue.includes(r) && !upcoming.includes(r)
  );

  const DeadlineRow = ({ req }: { req: IPRARequest }) => {
    const u3 = getDeadlineUrgency(req.three_day_deadline);
    const u15 = getDeadlineUrgency(req.fifteen_day_deadline);
    const days15 = daysUntil(req.fifteen_day_deadline);
    const isOverdue3 = u3 === "passed" && req.status !== "records_received";
    const isOverdue15 = u15 === "passed" && req.status !== "records_received";

    return (
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/requests/${req.id}`}
                className="text-sm font-semibold text-slate-800 hover:text-brand-600"
              >
                {req.title}
              </Link>
              <StatusBadge status={req.status} isOverdue={req.is_overdue} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{req.agency_name}</p>
            {req.submitted_date && (
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted {format(new Date(req.submitted_date), "MMM d, yyyy")}
                {req.submission_method && ` · ${req.submission_method.replace("_", " ")}`}
              </p>
            )}
          </div>

          {/* Deadline Badges */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className={clsx("border rounded-lg px-3 py-1.5 text-center min-w-[130px]", urgencyColor(u3))}>
              <p className="text-xs font-semibold">3-Day Response</p>
              <p className="text-xs font-bold mt-0.5">{formatDeadlineDate(req.three_day_deadline)}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {isOverdue3 ? "Response overdue" : u3 === "due_today" ? "Due today" : u3 === "approaching" ? "Due soon" : "Upcoming"}
              </p>
            </div>
            <div className={clsx("border rounded-lg px-3 py-1.5 text-center min-w-[130px]", urgencyColor(u15))}>
              <p className="text-xs font-semibold">15-Day Production</p>
              <p className="text-xs font-bold mt-0.5">{formatDeadlineDate(req.fifteen_day_deadline)}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {isOverdue15
                  ? "Production overdue"
                  : days15 !== null && days15 >= 0
                  ? `${days15}d remaining`
                  : "Upcoming"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    icon: Icon,
    items,
    emptyMsg,
    borderColor,
  }: {
    title: string;
    icon: typeof Clock;
    items: IPRARequest[];
    emptyMsg: string;
    borderColor: string;
  }) => (
    <div className={clsx("card border-l-4 overflow-hidden mb-5", borderColor)}>
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-slate-400 text-center">{emptyMsg}</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {items.map((r) => <DeadlineRow key={r.id} req={r} />)}
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="page-title">Deadline Tracker</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          IPRA statutory deadlines for all submitted requests
        </p>
      </div>

      {/* IPRA Rule Summary */}
      <div className="card p-5 mb-6 bg-slate-50">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
          New Mexico IPRA Deadline Rules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">3</span>
            <p><strong>3 business days:</strong> Agency must provide a written response if records are not immediately available. Weekends excluded.</p>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">15</span>
            <p><strong>15 calendar days:</strong> Records must be made available no later than 15 days after receipt of the request.</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Holidays are not currently factored into calculations.{" "}
          {/* TODO: Add holiday support in Phase 2+ */}
          This tool does not provide legal advice.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-base font-medium text-slate-700 mb-1">No deadlines to track</p>
          <p className="text-sm text-slate-400 mb-4">
            Deadlines appear here once you mark a request as submitted.
          </p>
          <Link href="/requests" className="btn-secondary">
            View Requests
          </Link>
        </div>
      ) : (
        <>
          <Section
            title="Overdue"
            icon={AlertTriangle}
            items={overdue}
            emptyMsg="No overdue requests."
            borderColor="border-red-400"
          />
          <Section
            title="Due Soon"
            icon={Clock}
            items={upcoming}
            emptyMsg="No upcoming deadlines in the next 2 days."
            borderColor="border-yellow-400"
          />
          <Section
            title="Tracking"
            icon={CheckCircle}
            items={tracking}
            emptyMsg="No other active deadlines."
            borderColor="border-slate-200"
          />
        </>
      )}
    </AppLayout>
  );
}

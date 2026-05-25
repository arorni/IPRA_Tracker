"use client";

import Link from "next/link";
import { Scale, Clock, FileText, Shield, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Draft & Improve Requests",
    desc: "Build precise IPRA request language with guided templates.",
  },
  {
    icon: Clock,
    title: "Track Statutory Deadlines",
    desc: "Automatically calculate 3-business-day and 15-calendar-day IPRA deadlines.",
  },
  {
    icon: Shield,
    title: "Organize Returned Records",
    desc: "Upload and summarize returned documents in one place.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">IPRA Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-medium text-brand-700 mb-6">
          New Mexico IPRA Compliance Tool
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
          Manage Public Records Requests
          <br />
          <span className="text-brand-600">with confidence.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
          A professional tool for journalists, researchers, and civic users to draft, submit,
          track, and organize New Mexico IPRA public records requests — with built-in deadline
          tracking and AI-assisted drafting.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="btn-primary px-6 py-3 text-base">
            Start Free <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="btn-secondary px-6 py-3 text-base">
            Sign In
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          This tool helps draft and track public records requests but does not provide legal advice.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        IPRA Tracker · New Mexico · Not legal advice · Phase 1 MVP
      </footer>
    </div>
  );
}

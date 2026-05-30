"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import type { Agency } from "@/types";

interface Props {
  agencies: Agency[];
  loading: boolean;
  selected: Agency | null;
  onSelect: (agency: Agency | null) => void;
}

export default function AgencyCombobox({ agencies, loading, selected, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = agencies.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    (a.city ?? "").toLowerCase().includes(query.toLowerCase()) ||
    (a.agency_type ?? "").toLowerCase().includes(query.toLowerCase())
  ).slice(0, 60);

  const handleSelect = (agency: Agency) => {
    onSelect(agency);
    setQuery("");
    setOpen(false);
    setHighlighted(0);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) handleSelect(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={selected ? selected.name : query}
          onChange={(e) => {
            if (selected) onSelect(null);
            setQuery(e.target.value);
            setHighlighted(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Loading agencies…" : "Search agencies…"}
          disabled={loading}
          className="input pl-9 pr-8"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {selected ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear selected agency"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
      </div>

      {open && !selected && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-slate-400">Loading agencies…</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">No agencies found.</p>
          ) : (
            filtered.map((agency, idx) => (
              <button
                key={agency.id}
                type="button"
                role="option"
                aria-selected={idx === highlighted}
                onClick={() => handleSelect(agency)}
                onMouseEnter={() => setHighlighted(idx)}
                className={`w-full text-left px-4 py-2.5 transition-colors border-b border-slate-50 last:border-0 ${
                  idx === highlighted ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-medium text-slate-800">{agency.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[agency.agency_type, agency.city, agency.state]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

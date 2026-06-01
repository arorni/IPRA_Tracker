"use client";

import { useEffect, useState, useRef } from "react";
import { Building2, ChevronDown, X, Loader2, Globe, Mail, Phone } from "lucide-react";
import { agenciesApi } from "@/lib/api";
import type { Agency } from "@/types";

interface Props {
  selectedAgency: Agency | null;
  onSelect: (agency: Agency | null) => void;
  inputValue: string;
  onInputChange: (val: string) => void;
  required?: boolean;
}

export default function AgencyCombobox({
  selectedAgency,
  onSelect,
  inputValue,
  onInputChange,
  required,
}: Props) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFetchLoading(true);
    agenciesApi
      .list()
      .then(({ data }) => setAgencies(data))
      .catch(() => setAgencies([]))
      .finally(() => setFetchLoading(false));
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (a.city ?? "").toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (agency: Agency) => {
    onSelect(agency);
    onInputChange(agency.name);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    onInputChange("");
  };

  const locationStr = selectedAgency
    ? [selectedAgency.city, selectedAgency.state].filter(Boolean).join(", ")
    : "";

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Input row */}
      <div className="relative">
        <input
          type="text"
          required={required}
          value={inputValue}
          onChange={(e) => {
            onInputChange(e.target.value);
            if (selectedAgency) onSelect(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search agencies…"
          className="input pr-8"
        />
        {fetchLoading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin pointer-events-none" />
        )}
        {!fetchLoading && selectedAgency && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {!fetchLoading && !selectedAgency && (
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {fetchLoading ? (
            <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading agencies…
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((agency) => (
              <button
                key={agency.id}
                type="button"
                onClick={() => handleSelect(agency)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
              >
                <p className="font-medium text-slate-800">{agency.name}</p>
                {(agency.agency_type || agency.city) && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[
                      agency.agency_type,
                      agency.city && agency.state
                        ? `${agency.city}, ${agency.state}`
                        : agency.city,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </button>
            ))
          ) : inputValue.length > 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">
              No agencies found. You can still type the agency name manually.
            </div>
          ) : null}
        </div>
      )}

      {/* Selected agency details card */}
      {selectedAgency && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">{selectedAgency.name}</span>
            {selectedAgency.agency_type && (
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {selectedAgency.agency_type}
              </span>
            )}
            {locationStr && (
              <span className="text-slate-400">{locationStr}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedAgency.ipra_email && (
              <div className="flex items-start gap-1.5 text-slate-600">
                <Mail className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block">IPRA Email</span>
                  <a
                    href={`mailto:${selectedAgency.ipra_email}`}
                    className="text-brand-600 hover:underline break-all"
                  >
                    {selectedAgency.ipra_email}
                  </a>
                </div>
              </div>
            )}
            {selectedAgency.phone && (
              <div className="flex items-start gap-1.5 text-slate-600">
                <Phone className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  {selectedAgency.phone}
                </div>
              </div>
            )}
            {selectedAgency.fax && (
              <div className="flex items-start gap-1.5 text-slate-600">
                <Phone className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block">Fax</span>
                  {selectedAgency.fax}
                </div>
              </div>
            )}
            {selectedAgency.website_url && (
              <div className="flex items-start gap-1.5 text-slate-600">
                <Globe className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block">Website</span>
                  <a
                    href={selectedAgency.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline truncate block max-w-[160px]"
                  >
                    {selectedAgency.website_url}
                  </a>
                </div>
              </div>
            )}
            {selectedAgency.nextrequest_url && (
              <div className="flex items-start gap-1.5 text-slate-600 sm:col-span-2">
                <Globe className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block">Online Portal (NextRequest)</span>
                  <a
                    href={selectedAgency.nextrequest_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline truncate block"
                  >
                    {selectedAgency.nextrequest_url}
                  </a>
                </div>
              </div>
            )}
          </div>

          {selectedAgency.notes && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 block mb-0.5">Submission Instructions</span>
              <p className="text-slate-600 leading-relaxed">{selectedAgency.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

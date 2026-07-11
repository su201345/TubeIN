"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  matchCount?: number;
}

export default function SearchBar({ value, onChange, matchCount }: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 w-4 h-4 text-muted pointer-events-none" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search transcript…"
        aria-label="Search transcript"
        className="w-full bg-surface border border-default rounded-xl pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-400 transition-shadow duration-150"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 p-1 rounded-md hover:bg-accent-50 dark:hover:bg-white/5 transition-colors duration-150"
        >
          <X className="w-3.5 h-3.5 text-muted" />
        </button>
      )}
      {value && typeof matchCount === "number" && (
        <span className="absolute -bottom-5 left-1 text-xs text-muted">
          {matchCount} match{matchCount === 1 ? "" : "es"}
        </span>
      )}
    </div>
  );
}

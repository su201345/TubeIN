"use client";

import { useState } from "react";
import { Globe2, Sparkles } from "lucide-react";
import type { SourceLanguage } from "@/lib/api";

const LANGUAGES: { value: SourceLanguage; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "te", label: "Telugu" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "en", label: "English" },
  { value: "other", label: "Other" },
];

interface UrlInputProps {
  onSubmit: (url: string, language: SourceLanguage) => void;
  isLoading: boolean;
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<SourceLanguage>("auto");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSubmit(url.trim(), language);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 bg-white dark:bg-surface border border-default rounded-2xl shadow-card p-3"
    >
      <div className="flex-1 flex items-center gap-2 px-3">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a YouTube video link…"
          aria-label="YouTube video URL"
          className="w-full bg-transparent outline-none text-base py-2 placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-default pt-3 sm:pt-0 sm:pl-3">
        <Globe2 className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SourceLanguage)}
          aria-label="Source language"
          className="bg-transparent outline-none text-sm py-2 pr-1 cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors duration-150 whitespace-nowrap"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        {isLoading ? "Generating…" : "Generate Transcript"}
      </button>
    </form>
  );
}

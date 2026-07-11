"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Copy, Check } from "lucide-react";
import type { TranscriptLine } from "@/lib/api";
import { formatTimestamp } from "@/lib/exportFormatters";
import SearchBar from "./SearchBar";
import LanguageToggle from "./LanguageToggle";
import ExportMenu from "./ExportMenu";

interface TranscriptPanelProps {
  jobId: string;
  lines: TranscriptLine[];
  detectedLanguageLabel: string;
  hasEnglish: boolean;
  activeTime: number;
  onSeek: (seconds: number) => void;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="transcript-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function TranscriptPanel({
  jobId,
  lines,
  detectedLanguageLabel,
  hasEnglish,
  activeTime,
  onSeek,
}: TranscriptPanelProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"original" | "en">(hasEnglish ? "en" : "original");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const activeIndex = useMemo(() => {
    let idx = -1;
    lines.forEach((line, i) => {
      if (activeTime >= line.start && activeTime < line.end) idx = i;
    });
    return idx;
  }, [lines, activeTime]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const el = lineRefs.current[activeIndex];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return lines
      .map((line, i) => ({ line, i }))
      .filter(({ line }) =>
        (view === "en" && line.text_en ? line.text_en : line.text)
          .toLowerCase()
          .includes(query.toLowerCase())
      );
  }, [lines, query, view]);

  useEffect(() => {
    if (matches.length === 0) return;
    const first = matches[0].i;
    lineRefs.current[first]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCopy() {
    const text = lines.map((l) => (view === "en" && l.text_en ? l.text_en : l.text)).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface border border-default rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-default space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <LanguageToggle
            view={view}
            onChange={setView}
            originalLabel={detectedLanguageLabel}
            hasEnglish={hasEnglish}
          />
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-default hover:border-accent-400 transition-colors duration-150 text-sm font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy
                </>
              )}
            </button>
            <ExportMenu jobId={jobId} lang={view} />
          </div>
        </div>
        <div className="relative pb-4">
          <SearchBar value={query} onChange={setQuery} matchCount={query ? matches.length : undefined} />
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-[600px]">
        {lines.map((line, i) => {
          const text = view === "en" && line.text_en ? line.text_en : line.text;
          const isActive = i === activeIndex;
          return (
            <div
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              onClick={() => onSeek(line.start)}
              className={`group flex gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent-50 dark:hover:bg-white/5 ${
                isActive ? "transcript-active" : ""
              }`}
            >
              <span className="flex items-center gap-1 text-xs font-mono text-muted shrink-0 pt-0.5 select-none">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {formatTimestamp(line.start)}
              </span>
              <p className="text-sm leading-relaxed">{highlightMatch(text, query)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

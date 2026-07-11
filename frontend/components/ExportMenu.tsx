"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileText, FileJson, FileType } from "lucide-react";
import { exportUrl } from "@/lib/api";

interface ExportMenuProps {
  jobId: string;
  lang: "original" | "en";
}

const FORMATS: { fmt: "txt" | "srt" | "vtt" | "docx"; label: string; icon: typeof FileText }[] = [
  { fmt: "txt", label: "Plain Text (.txt)", icon: FileText },
  { fmt: "srt", label: "Subtitles (.srt)", icon: FileJson },
  { fmt: "vtt", label: "WebVTT (.vtt)", icon: FileJson },
  { fmt: "docx", label: "Word Document (.docx)", icon: FileType },
];

export default function ExportMenu({ jobId, lang }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-default bg-white dark:bg-surface hover:border-accent-400 transition-colors duration-150 text-sm font-medium"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        Export
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 sm:left-0 mt-2 w-56 bg-white dark:bg-surface border border-default rounded-xl shadow-card overflow-hidden z-20 animate-fadeIn sm:animate-none"
        >
          {FORMATS.map(({ fmt, label, icon: Icon }) => (
            <a
              key={fmt}
              role="menuitem"
              href={exportUrl(jobId, fmt, lang)}
              download
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent-50 dark:hover:bg-white/5 transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <Icon className="w-4 h-4 text-muted" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

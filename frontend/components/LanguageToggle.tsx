"use client";

interface LanguageToggleProps {
  view: "original" | "en";
  onChange: (view: "original" | "en") => void;
  originalLabel: string;
  hasEnglish: boolean;
}

export default function LanguageToggle({
  view,
  onChange,
  originalLabel,
  hasEnglish,
}: LanguageToggleProps) {
  if (!hasEnglish) return null;

  return (
    <div
      role="tablist"
      aria-label="Transcript language"
      className="inline-flex bg-surface border border-default rounded-xl p-1 text-sm"
    >
      <button
        role="tab"
        aria-selected={view === "original"}
        onClick={() => onChange("original")}
        className={`px-3 py-1.5 rounded-lg transition-colors duration-150 ${
          view === "original"
            ? "bg-accent-600 text-white"
            : "text-muted hover:text-fg"
        }`}
      >
        {originalLabel}
      </button>
      <button
        role="tab"
        aria-selected={view === "en"}
        onClick={() => onChange("en")}
        className={`px-3 py-1.5 rounded-lg transition-colors duration-150 ${
          view === "en" ? "bg-accent-600 text-white" : "text-muted hover:text-fg"
        }`}
      >
        English
      </button>
    </div>
  );
}

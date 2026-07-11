"use client";

import { ShieldCheck, Globe, Infinity as InfinityIcon } from "lucide-react";
import UrlInput from "./UrlInput";
import type { SourceLanguage } from "@/lib/api";

interface HeroProps {
  onSubmit: (url: string, language: SourceLanguage) => void;
  isLoading: boolean;
}

export default function Hero({ onSubmit, isLoading }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent-50/70 to-transparent dark:from-white/5 pt-20 pb-14 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Free YouTube Transcript Generator
        </h1>
        <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-8">
          Turn any YouTube video into a searchable, exportable transcript —
          including Telugu, Hindi, Tamil and 100+ other languages, translated
          to English instantly.
        </p>

        <UrlInput onSubmit={onSubmit} isLoading={isLoading} />

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent-600" aria-hidden="true" />
            No login required
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-accent-600" aria-hidden="true" />
            100+ languages
          </span>
          <span className="flex items-center gap-1.5">
            <InfinityIcon className="w-4 h-4 text-accent-600" aria-hidden="true" />
            Free forever
          </span>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Does this work for videos in Telugu, Hindi, or Tamil?",
    a: "Yes. Speech recognition is run with an open-source Whisper model tuned for accuracy across Indic languages, and results can be translated to English automatically.",
  },
  {
    q: "What if the video already has captions?",
    a: "We check for existing YouTube captions first — if they're available in your target language, you get the transcript almost instantly instead of waiting for transcription.",
  },
  {
    q: "Is there a video length limit?",
    a: "Very long videos may be capped on the free-tier backend to keep processing times reasonable. Shorter videos (under ~30 minutes) work best.",
  },
  {
    q: "Why does it sometimes take a minute or more?",
    a: "Transcription runs on free-tier CPU hosting, which can be slower than paid GPU services — especially right after the backend has been idle and needs to wake up.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Paste a link and generate — there's no login, no email, and no usage paywall.",
  },
  {
    q: "What export formats are supported?",
    a: "Plain text (.txt), subtitle formats (.srt and .vtt), and a formatted Word document (.docx).",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently asked questions</h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className="border border-default rounded-2xl bg-white dark:bg-surface overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium"
              >
                {item.q}
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-muted transition-transform duration-150 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-muted leading-relaxed animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

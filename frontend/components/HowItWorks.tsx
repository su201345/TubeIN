import { Link2, Cog, FileDown } from "lucide-react";

const STEPS = [
  {
    icon: Link2,
    title: "Paste the video link",
    description: "Drop in any YouTube URL and optionally choose the spoken language.",
  },
  {
    icon: Cog,
    title: "We transcribe & translate",
    description:
      "We check for existing captions first, then fall back to speech recognition and translation for the original-language and English versions.",
  },
  {
    icon: FileDown,
    title: "Search, copy, or export",
    description:
      "Browse the timestamped transcript, jump to any moment, and export as TXT, SRT, VTT, or DOCX.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface border-y border-default px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted">Three steps, no sign-up required.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-600 flex items-center justify-center mb-4 shadow-soft relative">
                <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-surface border border-default text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { CaptionsOff, FileOutput, Globe2, KeyRound, SearchCode } from "lucide-react";

const FEATURES = [
  {
    icon: CaptionsOff,
    title: "Works Without Captions",
    description:
      "No subtitles on the video? We transcribe the spoken audio directly using open-source speech recognition — no captions required.",
  },
  {
    icon: FileOutput,
    title: "Multiple Export Formats",
    description:
      "Download your transcript as plain text, SRT or WebVTT subtitles, or a formatted Word document — whatever your workflow needs.",
  },
  {
    icon: Globe2,
    title: "100+ Languages",
    description:
      "Accurately transcribe Telugu, Hindi, Tamil, and dozens of other languages, then translate the result to English in one click.",
  },
  {
    icon: KeyRound,
    title: "No Login Required",
    description:
      "Paste a link and go. There's no account to create, no email to hand over, and no usage limits hiding behind a paywall.",
  },
  {
    icon: SearchCode,
    title: "Searchable With Timestamps",
    description:
      "Every line is timestamped and searchable — click any moment to jump straight to it in the video player.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why choose this tool</h2>
        <p className="text-muted max-w-lg mx-auto">
          Built for creators, researchers, and language learners who need
          accurate transcripts fast — without paying for it.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-white dark:bg-surface border border-default rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-150"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-white/5 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-accent-600" aria-hidden="true" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

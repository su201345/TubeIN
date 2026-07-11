"use client";

import { Loader2 } from "lucide-react";
import type { JobStage } from "@/lib/api";

const STAGE_LABELS: Record<JobStage, string> = {
  queued: "Queued — waking up the backend…",
  fetching_captions: "Checking for existing captions…",
  downloading_audio: "Downloading audio…",
  transcribing: "Transcribing speech…",
  translating: "Translating to English…",
  done: "Done",
  error: "Something went wrong",
};

interface LoadingStateProps {
  stage: JobStage;
  progress: number;
  message?: string | null;
}

export default function LoadingState({ stage, progress, message }: LoadingStateProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-surface border border-default rounded-2xl shadow-card p-8 text-center animate-fadeIn">
      <div className="flex justify-center mb-4">
        <Loader2 className="w-8 h-8 text-accent-600 animate-spin" aria-hidden="true" />
      </div>
      <p className="font-medium mb-1">{STAGE_LABELS[stage] || message}</p>
      <p className="text-sm text-muted mb-5">
        {stage === "queued"
          ? "Free-tier hosting can take 30–50s to wake up if it's been idle. Thanks for your patience."
          : "This can take a minute or two depending on video length and current load."}
      </p>

      <div className="w-full h-2 bg-surface border border-default rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-600 transition-all duration-500 ease-out"
          style={{ width: `${Math.max(6, progress)}%` }}
        />
      </div>

      <div className="mt-6 space-y-2 text-left">
        {(["fetching_captions", "downloading_audio", "transcribing", "translating"] as JobStage[]).map(
          (s, i) => {
            const order = ["queued", "fetching_captions", "downloading_audio", "transcribing", "translating", "done"];
            const currentIdx = order.indexOf(stage);
            const stepIdx = order.indexOf(s);
            const done = currentIdx > stepIdx;
            const active = currentIdx === stepIdx;
            return (
              <div key={s} className="flex items-center gap-3 text-sm">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    done ? "bg-emerald-500" : active ? "bg-accent-600 animate-pulse" : "bg-border"
                  }`}
                />
                <span className={done || active ? "text-fg" : "text-muted"}>{STAGE_LABELS[s]}</span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

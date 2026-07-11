"use client";

import { useCallback, useRef, useState } from "react";
import Hero from "@/components/Hero";
import VideoPlayer, { VideoPlayerHandle } from "@/components/VideoPlayer";
import TranscriptPanel from "@/components/TranscriptPanel";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import FeatureGrid from "@/components/FeatureGrid";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { createTranscriptJob, pollTranscriptJob, type JobStatus, type SourceLanguage } from "@/lib/api";

const LANGUAGE_LABELS: Record<string, string> = {
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  en: "English",
};

export default function Home() {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{ url: string; lang: SourceLanguage } | null>(null);
  const [activeTime, setActiveTime] = useState(0);
  const stopPollingRef = useRef<(() => void) | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);

  const startJob = useCallback(async (url: string, language: SourceLanguage) => {
    stopPollingRef.current?.();
    setLastSubmission({ url, lang: language });
    setStatus({ id: "", stage: "queued", progress: 0, message: "Submitting…" });

    try {
      const jobId = await createTranscriptJob(url, language, true);
      stopPollingRef.current = pollTranscriptJob(
        jobId,
        (s) => setStatus(s),
        (err) =>
          setStatus((prev) => ({
            id: prev?.id || "",
            stage: "error",
            progress: 0,
            error: err.message,
          }))
      );
    } catch (err) {
      setStatus({
        id: "",
        stage: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }, []);

  function handleRetry() {
    if (lastSubmission) {
      startJob(lastSubmission.url, lastSubmission.lang);
    }
  }

  function handleSeek(seconds: number) {
    setActiveTime(seconds);
    playerRef.current?.seekTo(seconds);
  }

  const isLoading = !!status && status.stage !== "done" && status.stage !== "error";
  const hasResult = status?.stage === "done" && status.lines && status.lines.length > 0;
  const detectedLangLabel = status?.detected_language
    ? LANGUAGE_LABELS[status.detected_language] || status.detected_language.toUpperCase()
    : "Original";

  return (
    <main>
      <Hero onSubmit={startJob} isLoading={isLoading} />

      <section className="max-w-6xl mx-auto px-6 -mt-2 pb-16">
        {!status && <EmptyState />}

        {isLoading && (
          <div className="pt-8">
            <LoadingState stage={status.stage} progress={status.progress} message={status.message} />
          </div>
        )}

        {status?.stage === "error" && (
          <div className="pt-8">
            <ErrorState message={status.error} onRetry={handleRetry} />
          </div>
        )}

        {hasResult && status.video_id && (
          <div className="grid lg:grid-cols-2 gap-6 pt-8 items-start">
            <div className="lg:sticky lg:top-6 space-y-4">
              <VideoPlayer
                ref={playerRef}
                videoId={status.video_id}
                title={status.video_title}
                onTimeUpdate={setActiveTime}
              />
              {status.video_title && (
                <h2 className="font-semibold text-lg leading-snug">{status.video_title}</h2>
              )}
            </div>

            <TranscriptPanel
              jobId={status.id}
              lines={status.lines!}
              detectedLanguageLabel={detectedLangLabel}
              hasEnglish={status.lines!.some((l) => !!l.text_en)}
              activeTime={activeTime}
              onSeek={handleSeek}
            />
          </div>
        )}
      </section>

      <FeatureGrid />
      <HowItWorks />
      <FAQ />
      <Footer />
    </main>
  );
}

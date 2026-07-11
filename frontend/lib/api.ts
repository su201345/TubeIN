export type SourceLanguage = "auto" | "te" | "hi" | "ta" | "en" | "other";

export type JobStage =
  | "queued"
  | "fetching_captions"
  | "downloading_audio"
  | "transcribing"
  | "translating"
  | "done"
  | "error";

export interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  text_en?: string | null;
}

export interface JobStatus {
  id: string;
  stage: JobStage;
  progress: number;
  message?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  duration?: number | null;
  detected_language?: string | null;
  source?: "captions" | "whisper" | null;
  lines?: TranscriptLine[] | null;
  error?: string | null;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export class ApiError extends Error {}

export async function createTranscriptJob(
  url: string,
  sourceLanguage: SourceLanguage,
  wantTranslation = true
): Promise<string> {
  const res = await fetch(`${API_BASE}/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      source_language: sourceLanguage,
      want_translation: wantTranslation,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.detail || "Couldn't submit this video. Check the link and try again.");
  }

  const data = await res.json();
  return data.id as string;
}

export async function getTranscriptJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/transcript/${jobId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new ApiError("Couldn't fetch job status.");
  }
  return res.json();
}

export function pollTranscriptJob(
  jobId: string,
  onUpdate: (status: JobStatus) => void,
  onError: (err: Error) => void,
  intervalMs = 2000
): () => void {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    try {
      const status = await getTranscriptJob(jobId);
      onUpdate(status);
      if (status.stage !== "done" && status.stage !== "error" && !stopped) {
        setTimeout(tick, intervalMs);
      }
    } catch (err) {
      if (!stopped) onError(err as Error);
    }
  };

  tick();

  return () => {
    stopped = true;
  };
}

export function exportUrl(
  jobId: string,
  format: "txt" | "srt" | "vtt" | "docx",
  lang: "original" | "en"
): string {
  return `${API_BASE}/export/${jobId}?fmt=${format}&lang=${lang}`;
}

import type { TranscriptLine } from "./api";

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, "0");
}

function formatSrtTime(seconds: number): string {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const msRemainder = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(msRemainder, 3)}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(",", ".");
}

function lineText(line: TranscriptLine, useEnglish: boolean): string {
  return useEnglish && line.text_en ? line.text_en : line.text;
}

export function buildTXT(lines: TranscriptLine[], useEnglish = false): string {
  return lines.map((l) => lineText(l, useEnglish)).join("\n");
}

export function buildSRT(lines: TranscriptLine[], useEnglish = false): string {
  return lines
    .map(
      (l, i) =>
        `${i + 1}\n${formatSrtTime(l.start)} --> ${formatSrtTime(l.end)}\n${lineText(l, useEnglish)}\n`
    )
    .join("\n");
}

export function buildVTT(lines: TranscriptLine[], useEnglish = false): string {
  const body = lines
    .map(
      (l) => `${formatVttTime(l.start)} --> ${formatVttTime(l.end)}\n${lineText(l, useEnglish)}\n`
    )
    .join("\n");
  return `WEBVTT\n\n${body}`;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${pad(m)}:${pad(s)}`;
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

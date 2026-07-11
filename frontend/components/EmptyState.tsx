import { FileVideo2 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16 px-6">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-accent-50 dark:bg-white/5 flex items-center justify-center mb-5">
        <FileVideo2 className="w-8 h-8 text-accent-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your transcript will appear here</h3>
      <p className="text-sm text-muted max-w-sm mx-auto">
        Paste a YouTube link above and hit Generate. Works even without existing
        captions — we'll transcribe and translate the speech for you.
      </p>
    </div>
  );
}

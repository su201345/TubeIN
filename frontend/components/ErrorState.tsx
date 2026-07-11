import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  message?: string | null;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-xl mx-auto text-center bg-white dark:bg-surface border border-default rounded-2xl shadow-card p-8 animate-fadeIn">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Couldn't generate this transcript</h3>
      <p className="text-sm text-muted mb-6">
        {message || "Couldn't fetch this video — check the link or try again."}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors duration-150"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}

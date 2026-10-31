'use client';

/**
 * Admin panel ka error boundary — seller/storefront se alag.
 */
import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] render failed:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Something went wrong on this page
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          This specific page failed to load — the rest of the management panel is operating normally.
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="h-10 px-5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
          {/*
            Intentional <a> tag, not <Link>: client router state may be corrupted in error boundary. Full reload clears it.
          */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/admin/dashboard"
            className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>

        {error?.message && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-mono text-left overflow-auto max-h-40 border border-rose-200 dark:border-rose-900/50">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {error.digest && (
          <p className="mt-4 text-[11px] text-slate-400 font-mono">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

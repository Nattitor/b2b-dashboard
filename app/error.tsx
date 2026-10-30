"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="page-container">
      <section
        className="glass-panel mx-auto my-12 flex max-w-xl flex-col items-start gap-5 p-7"
        role="alert"
      >
        <AlertTriangle className="size-8 text-amber-200" aria-hidden="true" />
        <p className="eyebrow">DATA UNAVAILABLE</p>
        <h1 className="font-display text-2xl font-semibold">
          This view could not be loaded.
        </h1>
        <p className="text-sm leading-7 text-slate-300">
          The data source did not respond as expected. No values have been
          substituted. Try again, or check the selected source and its
          configuration.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={retry} className="button-secondary">
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/" className="button-quiet">
            Overview <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

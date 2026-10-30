import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container">
      <section className="glass-panel mx-auto my-12 max-w-lg p-8">
        <p className="eyebrow mb-4">404 / NOT FOUND</p>
        <h1 className="font-display text-2xl font-semibold">
          This view isn’t in the workspace.
        </h1>
        <p className="my-5 text-sm text-slate-300">
          Return to the overview or find a payment in the ledger.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="button-secondary">
            Back to overview
          </Link>
          <Link href="/transactions" className="button-quiet">
            Transaction ledger
          </Link>
        </div>
      </section>
    </div>
  );
}

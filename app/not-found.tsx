import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-line bg-paper-raised px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Missing</p>
      <h1 className="serif mt-2 text-3xl">Page not found</h1>
      <p className="mt-3 text-sm text-ink-soft">
        This branch or page does not exist. Return to the group overview.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-paper"
      >
        Back to overview
      </Link>
    </div>
  );
}

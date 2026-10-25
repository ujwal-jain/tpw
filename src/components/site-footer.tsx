import { SOURCES } from "@/lib/sources";
import { DISCLOSURE } from "@/lib/constants";

/**
 * Deliberately quiet. The page should end on the ask, not on methodology —
 * the citations stay one click away for the staffer who goes looking.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="shell py-12">
        <details className="group">
          <summary className="label-xs cursor-pointer list-none transition-colors hover:text-ink">
            Sources &amp; method
            <span className="ml-2 inline-block transition-transform group-open:rotate-90">
              →
            </span>
          </summary>

          <dl className="mt-8 grid gap-x-16 gap-y-6 md:grid-cols-2">
            {SOURCES.map((s) => (
              <div key={s.claim} className="border-t border-rule pt-3">
                <dt className="text-[14px] text-ink">{s.claim}</dt>
                <dd className="mt-1 text-[13px] leading-relaxed text-muted">
                  {s.citation}
                </dd>
              </div>
            ))}
          </dl>

          <p className="measure mt-10 text-[13px] leading-relaxed text-muted">
            {DISCLOSURE} Participant records are modeled to reproduce the outcome rates
            TPW and CDCR publish, so the framework can be reviewed before any agency data
            is loaded. Member organizations would report real outcomes through the
            coalition&rsquo;s existing channels; replacing the dataset changes the numbers
            on these pages and nothing else.
          </p>
        </details>

        <p className="mt-10 text-[12px] text-muted">
          An independent prototype built for Transformative Programming Works. Not an
          official TPW publication.
        </p>
      </div>
    </footer>
  );
}

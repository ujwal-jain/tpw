import { SOURCES } from "@/lib/sources";
import { DISCLOSURE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="shell py-20">
        <h2 className="label-xs">Sources & method</h2>

        <dl className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-2">
          {SOURCES.map((s) => (
            <div key={s.claim} className="border-t border-rule pt-4">
              <dt className="text-[15px] text-ink">{s.claim}</dt>
              <dd className="mt-1 text-[14px] leading-relaxed text-muted">{s.citation}</dd>
            </div>
          ))}
        </dl>

        <p className="measure mt-16 border-t border-rule pt-6 text-[13px] leading-relaxed text-muted">
          {DISCLOSURE} Participant records are modeled to reproduce the outcome rates TPW
          and CDCR publish, so the framework can be reviewed before any agency data is
          loaded. Member organizations would report real outcomes through the coalition&rsquo;s
          existing channels; replacing the dataset changes the numbers on these pages and
          nothing else.
        </p>

        <p className="mt-8 text-[13px] text-muted">
          An independent prototype built for Transformative Programming Works. Not an
          official TPW publication.
        </p>
      </div>
    </footer>
  );
}

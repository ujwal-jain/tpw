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
          {DISCLOSURE} Figures are generated from a modeled participant dataset built to
          mirror published California outcome ranges, so the framework can be reviewed
          before any agency data is loaded. Replacing the dataset with verified
          department records changes the numbers on these pages and nothing else.
        </p>

        <p className="mt-8 text-[13px] text-muted">
          TPW Coalition · Transformative Programming Works
        </p>
      </div>
    </footer>
  );
}

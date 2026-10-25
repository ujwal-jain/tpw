import Link from "next/link";

export type Anchor = {
  title: string;
  body: string;
  figure: string;
  href: string;
};

export function AnchorList({ anchors }: { anchors: Anchor[] }) {
  return (
    <ol className="mt-16">
      {anchors.map((a, i) => (
        <li
          key={a.title}
          className="grid gap-x-10 gap-y-4 border-t border-rule py-9 md:grid-cols-12"
        >
          <div className="md:col-span-3">
            <span className="label-xs">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-2 text-[19px] leading-tight text-ink">{a.title}</h3>
          </div>

          <p className="text-[15px] leading-relaxed text-muted md:col-span-6">{a.body}</p>

          <div className="md:col-span-3 md:text-right">
            <Link href={a.href} className="group inline-block">
              <span className="block text-[26px] leading-none text-amber-ink">{a.figure}</span>
              <span className="mt-2 inline-block border-b border-rule pb-0.5 text-[13px] text-muted transition-colors group-hover:border-amber group-hover:text-ink">
                See the data →
              </span>
            </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Text wordmark — heavy TPW over a short gold rule. No image asset. */
export function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className="inline-block leading-none">
      <span
        className={`block font-[family-name:var(--font-poppins)] font-extrabold tracking-[-0.02em] ${
          lg ? "text-[34px]" : "text-[19px]"
        }`}
      >
        TPW
      </span>
      <span
        className={`mt-1 block bg-gold ${lg ? "h-[4px] w-10" : "h-[3px] w-6"}`}
        aria-hidden
      />
    </span>
  );
}

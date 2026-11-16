const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every occurrence of `term` (case-insensitive) in <mark>. Safe: text is never injected as HTML. */
export default function HighlightText({ text, term }: { text: string; term: string }) {
  const needle = term.trim();
  if (!needle) return <>{text}</>;
  // split() with a capture group puts the matches at the odd indexes
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-warning/40 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

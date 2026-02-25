type FormattingTipsheetProps = {
  className?: string;
};

type Tip = {
  title: string;
  example: string;
  note?: string;
};

const FENCE = '```';

const TIPS: Tip[] = [
  {
    title: 'Headings',
    example: '# Main Heading\n## Section Heading',
  },
  {
    title: 'Bold and Italic',
    example: '**Bold text** and *italic text*',
  },
  {
    title: 'Links',
    example: '[STEM Magazine](https://example.com)',
  },
  {
    title: 'Lists',
    example: '- Item one\n- Item two\n- Item three',
  },
  {
    title: 'Quotes',
    example: '> A short quote or callout',
  },
  {
    title: 'Code Block',
    example: `${FENCE}ts\nconst message = 'Hello';\n${FENCE}`,
  },
  {
    title: 'Math (Fenced Block Only)',
    example: `${FENCE}math\nE = mc^2\n${FENCE}`,
    note: 'Dollar signs are plain text. Prices like $25 will not trigger math.',
  },
];

export default function FormattingTipsheet({
  className = '',
}: FormattingTipsheetProps) {
  return (
    <details
      className={`overflow-hidden rounded-md border border-(--border) bg-(--background) ${className}`}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-(--foreground)">
        <span className="inline-flex items-center gap-2">
          <span>Formatting Tipsheet</span>
          <span className="text-xs font-normal text-(--muted-foreground)">
            Markdown + math quick examples
          </span>
        </span>
      </summary>

      <div className="space-y-3 border-t border-(--border) px-4 py-3">
        <p className="text-xs text-(--muted-foreground)">
          Use the examples below while writing. Math is only supported in fenced
          <code className="mx-1 rounded bg-(--muted) px-1.5 py-0.5 text-xs">
            math
          </code>
          blocks.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-md border border-(--border) bg-(--card) p-3"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--foreground)">
                {tip.title}
              </div>
              <pre className="overflow-x-auto rounded bg-(--muted) p-2 text-xs text-(--foreground)">
                <code>{tip.example}</code>
              </pre>
              {tip.note && (
                <p className="mt-2 text-xs text-(--muted-foreground)">
                  {tip.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

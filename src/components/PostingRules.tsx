type PostingRulesProps = {
  className?: string;
};

const EXPO_RULES = [
  'Only submit work you created or have permission to share.',
  'Credit every image using one of the two allowed options.',
  'No copyrighted images or media without permission or a valid license.',
  'Keep content respectful, student-safe, and appropriate for a school audience.',
  'Include clear project context and links when available (demo, repo, write-up).',
];

const NOW_RULES = [
  'Write in your own words; no copy-pasting articles.',
  'Cite sources for claims, data, or quotes in the Sources section.',
  'Credit every thumbnail image using one of the two allowed options.',
  'No copyrighted images or media without permission or a valid license.',
  'Keep titles accurate and avoid misleading claims.',
];

export default function PostingRules({ className = '' }: PostingRulesProps) {
  return (
    <div
      className={`rounded-lg border border-(--border) bg-(--card) p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-semibold text-(--foreground)">
          Posting Rules
        </h3>
        <span className="text-xs text-(--muted-foreground)">
          Please review before submitting
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="font-semibold text-(--foreground)">SM Expo</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-(--muted-foreground)">
            {EXPO_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-(--foreground)">SM Now</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-(--muted-foreground)">
            {NOW_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

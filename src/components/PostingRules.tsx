import Link from 'next/link';

type PostingRulesProps = {
  className?: string;
};

const EXPO_RULES = [
  'Only submit work you created or media you are licensed/authorized to use.',
  'Allowed images: your own photos/screenshots/diagrams, or licensed images with proper credit.',
  'Not allowed: copyrighted images without permission, watermark removal, or uncredited reposts.',
  'Credit every image with either "Original photo" or a custom citation.',
  'Keep content respectful, student-safe, and appropriate for a school audience.',
  'Include clear project context and links when available (demo, repo, write-up).',
];

const NOW_RULES = [
  'Write in your own words; no copy-pasting full sections from articles or websites.',
  'Cite claims, statistics, quotes, and research in the Sources (MLA) section.',
  'Credit the thumbnail image with either "Original photo" or a custom citation.',
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

      <div className="mt-4 rounded-md border border-(--border) bg-(--background) p-3 text-xs text-(--muted-foreground)">
        By submitting, you confirm you have rights to all uploaded media and
        that your citations are accurate. See{' '}
        <Link href="/tos" className="text-(--primary) underline">
          Terms of Service
        </Link>{' '}
        for full policy details.
      </div>
    </div>
  );
}

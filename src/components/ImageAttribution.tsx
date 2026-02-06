import Link from 'next/link';
import type { ImageAttribution } from '@/types';
import { getAttributionDisplay } from '@/lib/imageAttribution';

type ImageAttributionProps = {
  attribution?: ImageAttribution;
  author?: {
    id?: string;
    name?: string;
  };
  className?: string;
};

export default function ImageAttribution({
  attribution,
  author,
  className = '',
}: ImageAttributionProps) {
  const display = getAttributionDisplay(attribution, author);
  if (!display) return null;

  const isExternal = display.url?.startsWith('http') ?? false;

  return (
    <div className={`text-xs text-(--muted-foreground) ${className}`}>
      {display.url ? (
        isExternal ? (
          <a
            href={display.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-(--foreground) underline decoration-transparent hover:decoration-inherit transition-colors"
          >
            {display.text}
          </a>
        ) : (
          <Link
            href={display.url}
            className="hover:text-(--foreground) underline decoration-transparent hover:decoration-inherit transition-colors"
          >
            {display.text}
          </Link>
        )
      ) : (
        <span>{display.text}</span>
      )}
    </div>
  );
}

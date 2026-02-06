import type { ImageAttribution } from '@/types';

type AttributionAuthor = {
  id?: string;
  name?: string;
};

export type AttributionDisplay = {
  text: string;
  url?: string;
};

export function getAttributionDisplay(
  attribution: ImageAttribution | undefined,
  author?: AttributionAuthor
): AttributionDisplay | null {
  if (!attribution) return null;

  if (attribution.type === 'original') {
    const authorName = author?.name?.trim() || 'MRHS Student';
    const authorId = author?.id?.trim();
    return {
      text: `Original Photo From ${authorName}`,
      url: authorId ? `/author/${authorId}` : undefined,
    };
  }

  if (attribution.type === 'custom') {
    const creditText = attribution.creditText?.trim();
    if (!creditText) return null;
    const creditUrl = attribution.creditUrl?.trim();
    return { text: creditText, url: creditUrl || undefined };
  }

  return null;
}

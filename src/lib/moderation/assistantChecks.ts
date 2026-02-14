import { prisma } from '@/lib/prisma';
import type { AssistantWarning } from '@/types/moderation';

type SubmissionForChecks = {
  id: string;
  postType: 'SM_EXPO' | 'SM_NOW' | 'SM_PODS';
  title: string;
  content: string;
  sources: string | null;
  images: string[];
  thumbnailUrl: string | null;
  imageAttributions: unknown;
  thumbnailAttribution: unknown;
};

const LANGUAGE_TOOL_ENDPOINT = 'https://api.languagetool.org/v2/check';
const MAX_GRAMMAR_WARNINGS = 8;
const MAX_CANDIDATES = 120;

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'if',
  'then',
  'this',
  'that',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'as',
  'by',
  'at',
  'from',
  'it',
  'its',
  'into',
  'about',
  'their',
  'our',
  'your',
]);

function stripMarkdown(input: string): string {
  return input
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ');
}

function normalizeText(input: string): string {
  return stripMarkdown(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function makeNgrams(tokens: string[], size: number): Set<string> {
  if (tokens.length < size) return new Set(tokens);
  const grams: string[] = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    grams.push(tokens.slice(index, index + size).join(' '));
  }
  return new Set(grams);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const value of a) {
    if (b.has(value)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function scoreSimilarity(source: string, candidate: string): number {
  const sourceTokens = tokenize(source);
  const candidateTokens = tokenize(candidate);
  if (!sourceTokens.length || !candidateTokens.length) return 0;
  const sourceNgrams = makeNgrams(sourceTokens, 3);
  const candidateNgrams = makeNgrams(candidateTokens, 3);
  return jaccardSimilarity(sourceNgrams, candidateNgrams);
}

function scoreTitleOverlap(
  sourceTitle: string,
  candidateTitle: string
): number {
  const sourceTokens = new Set(tokenize(sourceTitle));
  const candidateTokens = new Set(tokenize(candidateTitle));
  return jaccardSimilarity(sourceTokens, candidateTokens);
}

function isLikelyCompleteAttribution(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const sourceUrl = record.sourceUrl || record.url || record.link;
  const authorName = record.authorName || record.creator || record.author;
  return typeof sourceUrl === 'string' && typeof authorName === 'string';
}

function mapGrammarIssueCodes(issueType: string): string[] {
  const normalized = issueType.toLowerCase();
  if (
    normalized.includes('misspelling') ||
    normalized.includes('typo') ||
    normalized.includes('punctuation') ||
    normalized.includes('grammar')
  ) {
    return ['SPELLING_AND_GRAMMAR'];
  }
  if (normalized.includes('style') || normalized.includes('redundancy')) {
    return ['CLARITY_AND_STRUCTURE'];
  }
  return ['CLARITY_AND_STRUCTURE'];
}

function runLocalGrammarFallback(content: string): AssistantWarning[] {
  const warnings: AssistantWarning[] = [];
  const sentences = content
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const longSentences = sentences.filter(
    (sentence) => sentence.split(/\s+/).length > 36
  ).length;

  if (longSentences > 0) {
    warnings.push({
      id: 'grammar-long-sentences',
      source: 'grammar',
      severity: longSentences > 2 ? 'medium' : 'low',
      message: 'Some sentences are very long and may reduce readability.',
      evidence: `${longSentences} long sentence(s) detected.`,
      suggestedIssueCodes: ['CLARITY_AND_STRUCTURE'],
      blocking: false,
    });
  }

  const punctuationClusters = content.match(/[!?]{3,}/g)?.length ?? 0;
  if (punctuationClusters > 0) {
    warnings.push({
      id: 'grammar-punctuation-cluster',
      source: 'grammar',
      severity: 'low',
      message: 'Repeated punctuation was detected.',
      evidence: `${punctuationClusters} repeated punctuation cluster(s).`,
      suggestedIssueCodes: ['SPELLING_AND_GRAMMAR'],
      blocking: false,
    });
  }

  return warnings;
}

async function runGrammarChecks(content: string): Promise<AssistantWarning[]> {
  const params = new URLSearchParams({
    text: content,
    language: 'en-US',
    enabledOnly: 'false',
  });

  try {
    const response = await fetch(LANGUAGE_TOOL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `LanguageTool request failed with status ${response.status}`
      );
    }

    const payload = (await response.json()) as {
      matches?: Array<{
        message?: string;
        offset?: number;
        length?: number;
        context?: { text?: string; offset?: number; length?: number };
        rule?: { issueType?: string };
      }>;
    };

    const matches = payload.matches ?? [];
    if (!matches.length) return [];

    return matches.slice(0, MAX_GRAMMAR_WARNINGS).map((match, index) => {
      const issueType = match.rule?.issueType || 'style';
      const severity = issueType === 'misspelling' ? 'low' : 'medium';
      const evidence = match.context?.text?.trim();
      return {
        id: `grammar-${issueType}-${index}`,
        source: 'grammar',
        severity,
        message: match.message || 'Potential grammar issue detected.',
        evidence,
        suggestedIssueCodes: mapGrammarIssueCodes(issueType),
        blocking: false,
      } as AssistantWarning;
    });
  } catch {
    return runLocalGrammarFallback(content);
  }
}

async function runCopyrightChecks(
  submission: SubmissionForChecks
): Promise<AssistantWarning[]> {
  const warnings: AssistantWarning[] = [];
  const content = submission.content || '';
  const sources = submission.sources?.trim() || '';

  const [posts, otherSubmissions] = await Promise.all([
    prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      take: MAX_CANDIDATES,
      select: {
        id: true,
        title: true,
        content: true,
      },
    }),
    prisma.submission.findMany({
      where: { id: { not: submission.id } },
      orderBy: { updatedAt: 'desc' },
      take: MAX_CANDIDATES,
      select: {
        id: true,
        title: true,
        content: true,
      },
    }),
  ]);

  const candidates = [...posts, ...otherSubmissions];
  let strongestCandidate: { title: string; score: number } | null = null;

  for (const candidate of candidates) {
    const score = scoreSimilarity(content, candidate.content || '');
    if (!strongestCandidate || score > strongestCandidate.score) {
      strongestCandidate = {
        title: candidate.title,
        score,
      };
    }
  }

  if (strongestCandidate && strongestCandidate.score >= 0.7) {
    warnings.push({
      id: 'copyright-high-similarity',
      source: 'copyright',
      severity: 'high',
      message:
        'High similarity detected with previously published or submitted content.',
      evidence: `Similar title: "${strongestCandidate.title}" (score ${strongestCandidate.score.toFixed(
        2
      )})`,
      suggestedIssueCodes: ['ORIGINALITY_AND_RIGHTS'],
      blocking: true,
    });
  } else if (strongestCandidate && strongestCandidate.score >= 0.45) {
    warnings.push({
      id: 'copyright-medium-similarity',
      source: 'copyright',
      severity: 'medium',
      message:
        'Moderate similarity detected with existing content. Review originality.',
      evidence: `Similar title: "${strongestCandidate.title}" (score ${strongestCandidate.score.toFixed(
        2
      )})`,
      suggestedIssueCodes: ['ORIGINALITY_AND_RIGHTS'],
      blocking: false,
    });
  }

  let strongestTitleMatch: { title: string; score: number } | null = null;
  for (const candidate of candidates) {
    const score = scoreTitleOverlap(submission.title, candidate.title);
    if (!strongestTitleMatch || score > strongestTitleMatch.score) {
      strongestTitleMatch = { title: candidate.title, score };
    }
  }
  if (strongestTitleMatch && strongestTitleMatch.score >= 0.85) {
    warnings.push({
      id: 'copyright-similar-title',
      source: 'copyright',
      severity: 'medium',
      message:
        'This title is very similar to an existing post/submission title.',
      evidence: `"${strongestTitleMatch.title}" (score ${strongestTitleMatch.score.toFixed(
        2
      )})`,
      suggestedIssueCodes: [
        'TITLE_ACCURACY',
        'CONTENT_ACCURACY',
        'ORIGINALITY_AND_RIGHTS',
      ],
      blocking: false,
    });
  }

  const claimSignals =
    content.match(
      /\b\d+(\.\d+)?%|\baccording to\b|\bresearch\b|\bstudy\b|\"[^\"]+\"/gi
    )?.length ?? 0;
  if (claimSignals >= 3 && !sources) {
    warnings.push({
      id: 'copyright-missing-citations-high',
      source: 'copyright',
      severity: 'high',
      message: 'Multiple factual claim signals were detected without sources.',
      evidence: `${claimSignals} claim/quote indicator(s) with no sources.`,
      suggestedIssueCodes: [
        'UNSUPPORTED_CLAIMS',
        'CONTENT_ACCURACY',
        'CITATION_FOR_CLAIMS',
        'SOURCES_PRESENT_AND_FORMATTED',
      ],
      blocking: true,
    });
  } else if (claimSignals > 0 && !sources) {
    warnings.push({
      id: 'copyright-missing-citations-medium',
      source: 'copyright',
      severity: 'medium',
      message: 'Claims or quotes detected but sources are missing.',
      evidence: `${claimSignals} claim/quote indicator(s) with no sources.`,
      suggestedIssueCodes: [
        'UNSUPPORTED_CLAIMS',
        'CONTENT_ACCURACY',
        'CITATION_FOR_CLAIMS',
        'SOURCES_PRESENT_AND_FORMATTED',
      ],
      blocking: false,
    });
  }

  if (submission.postType === 'SM_EXPO' && submission.images.length > 0) {
    const attributions = Array.isArray(submission.imageAttributions)
      ? submission.imageAttributions
      : [];
    const completeCount = attributions.filter(
      isLikelyCompleteAttribution
    ).length;
    if (completeCount < submission.images.length) {
      warnings.push({
        id: 'copyright-image-attribution',
        source: 'copyright',
        severity: 'medium',
        message:
          'Some project images appear to be missing complete attribution.',
        evidence: `${completeCount}/${submission.images.length} image attribution record(s) look complete.`,
        suggestedIssueCodes: ['IMAGE_ATTRIBUTION_COMPLETE'],
        blocking: false,
      });
    }
  }

  if (submission.postType === 'SM_NOW' && submission.thumbnailUrl) {
    if (!isLikelyCompleteAttribution(submission.thumbnailAttribution)) {
      warnings.push({
        id: 'copyright-thumbnail-attribution',
        source: 'copyright',
        severity: 'medium',
        message: 'Thumbnail attribution appears incomplete or missing.',
        suggestedIssueCodes: ['THUMBNAIL_ATTRIBUTION_COMPLETE'],
        blocking: false,
      });
    }
  }

  return warnings;
}

export async function getAssistantWarningsForSubmission(
  submissionId: string
): Promise<AssistantWarning[]> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      postType: true,
      title: true,
      content: true,
      sources: true,
      images: true,
      thumbnailUrl: true,
      imageAttributions: true,
      thumbnailAttribution: true,
    },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  const [grammarWarnings, copyrightWarnings] = await Promise.all([
    runGrammarChecks(submission.content || ''),
    runCopyrightChecks(submission as SubmissionForChecks),
  ]);

  return [...grammarWarnings, ...copyrightWarnings];
}

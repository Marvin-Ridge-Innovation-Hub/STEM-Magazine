/**
 * Content moderation utilities for filtering inappropriate content
 */

// Common profanity and inappropriate words (expandable list)
// This is a basic list - consider using a more comprehensive library for production
const BLOCKED_WORDS = [
  // Profanity
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'hell',
  'crap',
  'dick',
  'cock',
  'pussy',
  'bastard',
  'slut',
  'whore',
  'fag',
  'faggot',
  'retard',
  'retarded',
  // Slurs and hate speech
  'nigger',
  'nigga',
  'chink',
  'spic',
  'kike',
  'gook',
  // Variations with special characters
  'f*ck',
  'sh*t',
  'b*tch',
  'a$$',
  'd*ck',
  // Common leetspeak variations
  'f u c k',
  's h i t',
  'b i t c h',
  'fuk',
  'fck',
  'sht',
  'btch',
];

// Patterns that should be blocked (regex)
const BLOCKED_PATTERNS = [
  // Repeated characters (spam)
  /(.)\1{4,}/gi, // Same character 5+ times
  // All caps spam (more than 50 chars all caps)
  /^[A-Z\s!?.]{50,}$/,
  // Excessive punctuation
  /[!?]{5,}/g,
  // URLs (optional - uncomment if you want to block links)
  // /https?:\/\/[^\s]+/gi,
  // Email addresses (to prevent sharing personal info)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  // Phone numbers
  /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
];

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
  flaggedWords?: string[];
}

export const COMMENT_MAX_LENGTH = 1000;
export const COMMENT_MIN_LENGTH = 1;

/**
 * Check if content contains blocked words
 */
function containsBlockedWords(content: string): {
  blocked: boolean;
  words: string[];
} {
  const lowerContent = content.toLowerCase();
  const flaggedWords: string[] = [];

  for (const word of BLOCKED_WORDS) {
    // Create word boundary regex to avoid false positives
    // e.g., "class" shouldn't match "ass"
    const regex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'gi'
    );
    if (regex.test(lowerContent)) {
      flaggedWords.push(word);
    }
  }

  return {
    blocked: flaggedWords.length > 0,
    words: flaggedWords,
  };
}

/**
 * Check if content matches blocked patterns
 */
function matchesBlockedPatterns(content: string): {
  blocked: boolean;
  reason?: string;
} {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      // Reset regex lastIndex
      pattern.lastIndex = 0;

      if (pattern.source.includes('(.)\\1{4,}')) {
        return {
          blocked: true,
          reason: 'Excessive repeated characters detected',
        };
      }
      if (pattern.source.includes('[A-Z')) {
        return { blocked: true, reason: 'Excessive use of capital letters' };
      }
      if (pattern.source.includes('[!?]')) {
        return { blocked: true, reason: 'Excessive punctuation' };
      }
      if (pattern.source.includes('@')) {
        return {
          blocked: true,
          reason: 'Email addresses are not allowed in comments',
        };
      }
      if (pattern.source.includes('\\d{3}')) {
        return {
          blocked: true,
          reason: 'Phone numbers are not allowed in comments',
        };
      }
      return { blocked: true, reason: 'Content contains prohibited patterns' };
    }
  }

  return { blocked: false };
}

/**
 * Main moderation function - checks content for appropriateness
 */
export function moderateContent(content: string): ModerationResult {
  // Check length
  if (content.length < COMMENT_MIN_LENGTH) {
    return {
      isClean: false,
      reason: 'Comment is too short',
    };
  }

  if (content.length > COMMENT_MAX_LENGTH) {
    return {
      isClean: false,
      reason: `Comment exceeds maximum length of ${COMMENT_MAX_LENGTH} characters`,
    };
  }

  // Check for blocked words
  const wordCheck = containsBlockedWords(content);
  if (wordCheck.blocked) {
    return {
      isClean: false,
      reason: 'Comment contains inappropriate language',
      flaggedWords: wordCheck.words,
    };
  }

  // Check for blocked patterns
  const patternCheck = matchesBlockedPatterns(content);
  if (patternCheck.blocked) {
    return {
      isClean: false,
      reason: patternCheck.reason,
    };
  }

  return { isClean: true };
}

/**
 * Sanitize content by removing potentially dangerous characters
 * (basic XSS prevention - Next.js/React handles most of this automatically)
 */
export function sanitizeContent(content: string): string {
  return (
    content
      .trim()
      // Remove null bytes
      .replace(/\0/g, '')
      // Normalize whitespace (but preserve single newlines)
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
  );
}

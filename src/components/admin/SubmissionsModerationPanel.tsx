'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, BookOpen, RefreshCw, Search } from 'lucide-react';
import PostingRules from '@/components/PostingRules';
import MarkdownContent from '@/components/MarkdownContent';
import ImageAttributionDisplay from '@/components/ImageAttribution';
import type { ImageAttribution } from '@/types';
import type {
  AssistantWarning,
  AssistantWarningSeverity,
} from '@/types/moderation';

type SubmissionStatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

type Submission = {
  id: string;
  postType: 'SM_EXPO' | 'SM_NOW' | 'SM_PODS';
  title: string;
  content: string;
  thumbnailUrl?: string;
  images: string[];
  imageAttributions?: ImageAttribution[];
  thumbnailAttribution?: ImageAttribution;
  projectLinks: string[];
  sources?: string;
  tags: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  canMoveToDraft: boolean;
  canReview?: boolean;
  reviewBlockedReason?: string | null;
  createdAt: string;
  author: { id: string; email: string; name?: string };
};

type Message = { type: 'success' | 'error'; text: string } | null;

type Props = {
  submissions: Submission[];
  submissionsLoading: boolean;
  stats: { pending: number; approved: number; rejected: number; total: number };
  filter: SubmissionStatusFilter;
  onFilterChange: (filter: SubmissionStatusFilter) => void;
  message: Message;
  actionLoading: string | null;
  allowMoveToDraft: boolean;
  onAllowMoveToDraftChange: (value: boolean) => void;
  onApprove: (submissionId: string) => Promise<void>;
  onReject: (submissionId: string, rejectionReason: string) => Promise<void>;
  onOpenFullContent: (submission: Submission) => void;
};

type IssueDefinition = {
  code: string;
  title: string;
  appliesTo: 'ALL' | 'SM_EXPO' | 'SM_NOW' | 'SM_PODS';
  template: string;
};

const ISSUE_DEFINITIONS: IssueDefinition[] = [
  {
    code: 'CONTENT_SAFETY',
    title: 'Content safety',
    appliesTo: 'ALL',
    template:
      'Content includes material not appropriate for a school publication.',
  },
  {
    code: 'ORIGINALITY_AND_RIGHTS',
    title: 'Originality and rights',
    appliesTo: 'ALL',
    template:
      'We could not verify publication rights for some submitted material.',
  },
  {
    code: 'TITLE_ACCURACY',
    title: 'Title accuracy',
    appliesTo: 'ALL',
    template: 'The title is misleading or does not match the content.',
  },
  {
    code: 'CITATION_FOR_CLAIMS',
    title: 'Citations for claims',
    appliesTo: 'ALL',
    template: 'Claims, statistics, or quotations require clearer citations.',
  },
  {
    code: 'IMAGE_ATTRIBUTION_COMPLETE',
    title: 'Image attribution complete',
    appliesTo: 'SM_EXPO',
    template: 'One or more project images need complete attribution details.',
  },
  {
    code: 'PROJECT_LINKS_VALID',
    title: 'Project links valid',
    appliesTo: 'SM_EXPO',
    template: 'One or more project links are invalid or unrelated.',
  },
  {
    code: 'THUMBNAIL_ATTRIBUTION_COMPLETE',
    title: 'Thumbnail attribution complete',
    appliesTo: 'SM_NOW',
    template: 'The thumbnail attribution is incomplete.',
  },
  {
    code: 'SOURCES_PRESENT_AND_FORMATTED',
    title: 'Sources present and formatted',
    appliesTo: 'SM_NOW',
    template: 'The sources section needs additional or clearer references.',
  },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getWarningTone = (severity: AssistantWarningSeverity) => {
  if (severity === 'high') {
    return 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300';
  }
  if (severity === 'medium') {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }
  return 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300';
};

export default function SubmissionsModerationPanel({
  submissions,
  submissionsLoading,
  stats,
  filter,
  onFilterChange,
  message,
  actionLoading,
  allowMoveToDraft,
  onAllowMoveToDraftChange,
  onApprove,
  onReject,
  onOpenFullContent,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIssueCodes, setSelectedIssueCodes] = useState<string[]>([]);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [assistantWarnings, setAssistantWarnings] = useState<
    AssistantWarning[]
  >([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  const queue = useMemo(() => {
    return submissions
      .filter((submission) => filter === 'ALL' || submission.status === filter)
      .filter((submission) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          submission.title.toLowerCase().includes(q) ||
          (submission.author.name || submission.author.email)
            .toLowerCase()
            .includes(q)
        );
      });
  }, [submissions, filter, search]);

  useEffect(() => {
    if (!queue.length) {
      setSelectedId(null);
      return;
    }
    if (
      !selectedId ||
      !queue.some((submission) => submission.id === selectedId)
    ) {
      setSelectedId(queue[0].id);
    }
  }, [queue, selectedId]);

  const selected = useMemo(
    () => queue.find((submission) => submission.id === selectedId) || null,
    [queue, selectedId]
  );

  const applicableIssues = useMemo(() => {
    if (!selected) return [];
    return ISSUE_DEFINITIONS.filter(
      (issue) =>
        issue.appliesTo === 'ALL' || issue.appliesTo === selected.postType
    );
  }, [selected]);

  const runAssistantChecks = useCallback(async (submissionId: string) => {
    setAssistantLoading(true);
    setAssistantError(null);
    try {
      const response = await fetch(
        `/api/admin/submissions/assistant-warnings/${submissionId}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to run assistant checks.');
      }
      setAssistantWarnings(data.warnings || []);
    } catch (error) {
      setAssistantWarnings([]);
      setAssistantError(
        error instanceof Error
          ? error.message
          : 'Failed to run assistant checks.'
      );
    } finally {
      setAssistantLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setSelectedIssueCodes([]);
      setModeratorNotes('');
      setAssistantWarnings([]);
      setAssistantError(null);
      setAssistantLoading(false);
      return;
    }

    setSelectedIssueCodes([]);
    setModeratorNotes('');
    if (selected.canReview === false) {
      setAssistantWarnings([]);
      setAssistantError(null);
      setAssistantLoading(false);
      return;
    }
    void runAssistantChecks(selected.id);
  }, [selected?.id, selected?.canReview, runAssistantChecks]);

  const issueTemplateMap = useMemo(
    () =>
      Object.fromEntries(
        ISSUE_DEFINITIONS.map((issue) => [issue.code, issue.template])
      ) as Record<string, string>,
    []
  );

  const blockingWarnings = useMemo(
    () => assistantWarnings.filter((warning) => warning.blocking),
    [assistantWarnings]
  );

  const hasSelectedIssues = selectedIssueCodes.length > 0;
  const actionInProgress = selected ? actionLoading === selected.id : false;
  const isPendingSubmission = selected?.status === 'PENDING';
  const selectedCanReview = selected ? selected.canReview !== false : false;

  const canReject = Boolean(
    selectedCanReview &&
    isPendingSubmission &&
    hasSelectedIssues &&
    !actionInProgress
  );
  const canApprove = Boolean(
    selectedCanReview &&
    isPendingSubmission &&
    !hasSelectedIssues &&
    blockingWarnings.length === 0 &&
    !assistantLoading &&
    !actionInProgress
  );

  const rejectionText = useMemo(() => {
    if (!selected || !hasSelectedIssues) return '';

    const reasons = selectedIssueCodes.map(
      (code) => issueTemplateMap[code] || code
    );
    const lines = [
      `Thanks for submitting "${selected.title}". We cannot publish it yet for the reasons below:`,
      ...reasons.map((reason) => `- ${reason}`),
    ];

    if (moderatorNotes.trim()) {
      lines.push('', 'Moderator notes:', moderatorNotes.trim());
    }

    lines.push('', 'Please revise and resubmit.');
    return lines.join('\n');
  }, [
    selected,
    hasSelectedIssues,
    selectedIssueCodes,
    issueTemplateMap,
    moderatorNotes,
  ]);

  const toggleIssue = (code: string, checked: boolean) => {
    setSelectedIssueCodes((previous) => {
      if (checked) {
        if (previous.includes(code)) return previous;
        return [...previous, code];
      }
      return previous.filter((existing) => existing !== code);
    });
  };

  const addIssuesFromWarning = (warning: AssistantWarning) => {
    if (!selectedCanReview) return;

    const allowedCodes = new Set(applicableIssues.map((issue) => issue.code));
    const nextCodes = warning.suggestedIssueCodes.filter((code) =>
      allowedCodes.has(code)
    );
    if (!nextCodes.length) return;

    setSelectedIssueCodes((previous) => {
      const merged = new Set(previous);
      nextCodes.forEach((code) => merged.add(code));
      return Array.from(merged);
    });
  };

  const approveHint = !selectedCanReview
    ? selected?.reviewBlockedReason ||
      'You cannot review this submission with your current role.'
    : !isPendingSubmission
      ? 'Only pending submissions can be approved.'
      : hasSelectedIssues
        ? 'Clear selected issues before approving.'
        : blockingWarnings.length > 0
          ? 'Resolve blocking assistant warnings before approving.'
          : assistantLoading
            ? 'Assistant checks are still running.'
            : null;

  const rejectHint = !selectedCanReview
    ? selected?.reviewBlockedReason ||
      'You cannot review this submission with your current role.'
    : !isPendingSubmission
      ? 'Only pending submissions can be rejected.'
      : hasSelectedIssues
        ? null
        : 'Select at least one issue to enable rejection.';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-(--border) bg-(--card) p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500">
            {stats.pending}
          </div>
          <div className="text-sm text-(--muted-foreground)">Pending</div>
        </div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-4 text-center">
          <div className="text-3xl font-bold text-green-500">
            {stats.approved}
          </div>
          <div className="text-sm text-(--muted-foreground)">Approved</div>
        </div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-4 text-center">
          <div className="text-3xl font-bold text-red-500">
            {stats.rejected}
          </div>
          <div className="text-sm text-(--muted-foreground)">Rejected</div>
        </div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-4 text-center">
          <div className="text-3xl font-bold text-(--foreground)">
            {stats.total}
          </div>
          <div className="text-sm text-(--muted-foreground)">Total</div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
              : 'border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <PostingRules />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="space-y-2 rounded-lg border border-(--border) bg-(--card) p-3">
            <div className="flex flex-wrap gap-2">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => onFilterChange(status)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      filter === status
                        ? 'bg-(--accent) text-(--accent-foreground)'
                        : 'bg-(--muted) text-(--foreground)'
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-8 pr-3 text-(--foreground)"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-(--border) bg-(--card)">
            <div className="border-b border-(--border) px-3 py-2 text-sm font-semibold text-(--foreground)">
              Queue ({queue.length})
            </div>
            <div className="max-h-[40vh] overflow-y-auto sm:max-h-[68vh]">
              {submissionsLoading ? (
                <div className="p-3 text-sm text-(--muted-foreground)">
                  Loading...
                </div>
              ) : !queue.length ? (
                <div className="p-3 text-sm text-(--muted-foreground)">
                  No submissions
                </div>
              ) : (
                queue.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => setSelectedId(submission.id)}
                    className={`w-full border-b border-(--border) p-3 text-left ${
                      selectedId === submission.id
                        ? 'bg-(--accent)/40'
                        : 'hover:bg-(--muted)/30'
                    }`}
                  >
                    <div className="flex gap-2">
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-(--muted)">
                        {submission.thumbnailUrl ? (
                          <Image
                            src={submission.thumbnailUrl}
                            alt={submission.title}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-(--foreground)">
                          {submission.title}
                        </p>
                        <p className="truncate text-xs text-(--muted-foreground)">
                          {submission.author.name || submission.author.email}
                        </p>
                        <p className="text-[11px] text-(--muted-foreground)">
                          {formatDate(submission.createdAt)}
                        </p>
                        {submission.canReview === false ? (
                          <p className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Locked: your submission
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {!selected ? (
            <div className="rounded-lg border border-(--border) bg-(--card) p-6 text-(--muted-foreground)">
              Select a submission to review.
            </div>
          ) : selected.canReview === false ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-6">
              <h2 className="text-xl font-bold text-(--foreground)">
                {selected.title}
              </h2>
              <p className="mt-1 break-words text-sm text-(--muted-foreground)">
                By {selected.author.name || selected.author.email} -{' '}
                {formatDate(selected.createdAt)}
              </p>
              <p className="mt-4 text-sm font-medium text-amber-700 dark:text-amber-300">
                {selected.reviewBlockedReason ||
                  'Moderators cannot review their own submissions.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-lg border border-(--border) bg-(--card) p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-(--foreground)">
                      {selected.title}
                    </h2>
                    <p className="break-words text-sm text-(--muted-foreground)">
                      By {selected.author.name || selected.author.email} -{' '}
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenFullContent(selected)}
                    className="inline-flex items-center gap-1 self-start text-xs font-semibold text-(--primary) hover:underline"
                  >
                    <BookOpen className="h-3 w-3" />
                    View full
                  </button>
                </div>

                <div className="line-clamp-8 rounded border border-(--border) bg-(--background) p-3">
                  <MarkdownContent
                    content={selected.content}
                    className="prose prose-sm max-w-none text-(--foreground)"
                  />
                </div>

                <div className="space-y-4 rounded border border-(--border) bg-(--background) p-3">
                  <h3 className="font-semibold text-(--foreground)">
                    Submission details
                  </h3>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                      Media
                    </p>
                    {selected.postType === 'SM_EXPO' ? (
                      selected.images.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {selected.images.map((imageUrl, index) => {
                            const attribution =
                              selected.imageAttributions?.[index];
                            return (
                              <div
                                key={`${imageUrl}-${index}`}
                                className="space-y-1 rounded border border-(--border) bg-(--card) p-2"
                              >
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative block aspect-video overflow-hidden rounded border border-(--border)"
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`Submission image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </a>
                                {attribution ? (
                                  <ImageAttributionDisplay
                                    attribution={attribution}
                                    author={{
                                      id: selected.author.id,
                                      name: selected.author.name,
                                    }}
                                  />
                                ) : (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    Attribution missing.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-(--muted-foreground)">
                          No images provided.
                        </p>
                      )
                    ) : selected.thumbnailUrl ? (
                      <div className="max-w-md space-y-1 rounded border border-(--border) bg-(--card) p-2">
                        <a
                          href={selected.thumbnailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block aspect-video overflow-hidden rounded border border-(--border)"
                        >
                          <Image
                            src={selected.thumbnailUrl}
                            alt={`${selected.title} thumbnail`}
                            fill
                            className="object-cover"
                          />
                        </a>
                        {selected.thumbnailAttribution ? (
                          <ImageAttributionDisplay
                            attribution={selected.thumbnailAttribution}
                            author={{
                              id: selected.author.id,
                              name: selected.author.name,
                            }}
                          />
                        ) : (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Thumbnail attribution missing.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-(--muted-foreground)">
                        No thumbnail provided.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                      Tags
                    </p>
                    {selected.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selected.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-(--muted) px-2 py-1 text-xs text-(--foreground)"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-(--muted-foreground)">
                        No tags provided.
                      </p>
                    )}
                  </div>

                  {selected.postType === 'SM_EXPO' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                        Project links
                      </p>
                      {selected.projectLinks.length > 0 ? (
                        <ul className="space-y-1">
                          {selected.projectLinks.map((projectLink, index) => (
                            <li key={`${projectLink}-${index}`}>
                              <a
                                href={projectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all text-sm text-(--primary) hover:underline"
                              >
                                {projectLink}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-(--muted-foreground)">
                          No project links provided.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {selected.postType === 'SM_NOW' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                        Works cited
                      </p>
                      {selected.sources?.trim() ? (
                        <div className="whitespace-pre-wrap break-words rounded border border-(--border) bg-(--card) p-2 text-sm text-(--foreground)">
                          {selected.sources}
                        </div>
                      ) : (
                        <p className="text-sm text-(--muted-foreground)">
                          No sources provided.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-(--border) bg-(--card) p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold text-(--foreground)">
                    Assistant warnings
                  </h3>
                  <button
                    onClick={() => void runAssistantChecks(selected.id)}
                    disabled={assistantLoading}
                    className="inline-flex items-center gap-1 self-start rounded border border-(--border) px-3 py-1 text-xs text-(--foreground) disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${assistantLoading ? 'animate-spin' : ''}`}
                    />
                    Re-run checks
                  </button>
                </div>

                {assistantLoading ? (
                  <p className="text-sm text-(--muted-foreground)">
                    Running assistant checks...
                  </p>
                ) : assistantError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {assistantError}
                  </p>
                ) : !assistantWarnings.length ? (
                  <p className="text-sm text-(--muted-foreground)">
                    No warnings found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assistantWarnings.map((warning) => (
                      <div
                        key={warning.id}
                        className={`rounded border p-2 text-sm ${getWarningTone(
                          warning.severity
                        )}`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold">
                              <AlertTriangle className="mr-1 inline h-4 w-4" />
                              {warning.message}
                            </p>
                            <p className="text-xs uppercase tracking-wide">
                              {warning.source} - {warning.severity}
                              {warning.blocking ? ' - blocking' : ''}
                            </p>
                            {warning.evidence ? (
                              <p className="mt-1 text-xs">
                                Evidence: {warning.evidence}
                              </p>
                            ) : null}
                          </div>
                          <button
                            onClick={() => addIssuesFromWarning(warning)}
                            disabled={!warning.suggestedIssueCodes.length}
                            className="self-start rounded border border-current px-2 py-1 text-xs disabled:opacity-50"
                          >
                            Add as issue
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-(--border) bg-(--card) p-4">
                <h3 className="font-bold text-(--foreground)">Decision</h3>
                <p className="text-xs text-(--muted-foreground)">
                  Select issue categories for this decision.
                </p>

                <div className="grid gap-1 md:grid-cols-2">
                  {applicableIssues.map((issue) => (
                    <label
                      key={issue.code}
                      className="inline-flex items-center gap-2 text-xs text-(--foreground)"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIssueCodes.includes(issue.code)}
                        onChange={(event) =>
                          toggleIssue(issue.code, event.target.checked)
                        }
                      />
                      {issue.title}
                    </label>
                  ))}
                </div>

                <textarea
                  value={moderatorNotes}
                  onChange={(event) => setModeratorNotes(event.target.value)}
                  rows={3}
                  disabled={!hasSelectedIssues}
                  placeholder={
                    hasSelectedIssues
                      ? 'Moderator notes (optional)'
                      : 'Select at least one issue to add notes.'
                  }
                  className="w-full rounded border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) disabled:opacity-60"
                />

                <textarea
                  readOnly
                  value={
                    hasSelectedIssues
                      ? rejectionText
                      : 'Select at least one issue to generate a rejection message.'
                  }
                  rows={7}
                  className="w-full rounded border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground)"
                />

                <label className="inline-flex items-center gap-2 text-sm text-(--foreground)">
                  <input
                    type="checkbox"
                    checked={allowMoveToDraft}
                    disabled={!hasSelectedIssues}
                    onChange={(event) =>
                      onAllowMoveToDraftChange(event.target.checked)
                    }
                  />
                  Allow move to draft after rejection
                </label>

                {approveHint ? (
                  <p className="text-xs text-(--muted-foreground)">
                    {approveHint}
                  </p>
                ) : null}
                {rejectHint ? (
                  <p className="text-xs text-(--muted-foreground)">
                    {rejectHint}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    disabled={!canApprove}
                    onClick={() => void onApprove(selected.id)}
                    className="w-full rounded bg-green-500 px-4 py-2 font-semibold text-white disabled:opacity-50 sm:w-auto"
                  >
                    {actionInProgress ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    disabled={!canReject}
                    onClick={() => void onReject(selected.id, rejectionText)}
                    className="w-full rounded bg-red-500 px-4 py-2 font-semibold text-white disabled:opacity-50 sm:w-auto"
                  >
                    {actionInProgress
                      ? 'Processing...'
                      : 'Reject with template'}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

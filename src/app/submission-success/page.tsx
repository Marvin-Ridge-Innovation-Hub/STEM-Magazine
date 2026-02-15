'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function SubmissionSuccessContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const warning = searchParams.get('warning');

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) p-4">
      <div className="max-w-md w-full bg-(--card) border-2 border-(--border) rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Clock className="w-20 h-20 text-blue-500" />
            <CheckCircle className="w-8 h-8 text-green-500 absolute -bottom-1 -right-1 bg-(--card) rounded-full" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-(--foreground) mb-4">
          Submission Received!
        </h1>

        <p className="text-(--muted-foreground) mb-6">
          Your post has been submitted for review. You'll receive an email
          notification once a moderator reviews your submission.
        </p>

        {warning && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 mb-6">
            <p className="font-semibold mb-1">Submission saved</p>
            <p>{warning}</p>
          </div>
        )}

        {submissionId && (
          <p className="text-xs text-(--muted-foreground) mb-6">
            Reference ID: <span className="font-mono">{submissionId}</span>
          </p>
        )}

        <div className="bg-(--muted) rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-(--foreground) mb-2">
            What's Next?
          </h3>
          <ul className="text-sm text-(--muted-foreground) text-left space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Our moderation team will review your submission</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                You'll receive an email when it's approved or if changes are
                needed
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Track your submission status in your dashboard</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/create"
            className="w-full px-6 py-3 bg-(--secondary) text-(--secondary-foreground) rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Create Another Post
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--background)">
          <div className="text-(--foreground)">Loading...</div>
        </div>
      }
    >
      <SubmissionSuccessContent />
    </Suspense>
  );
}

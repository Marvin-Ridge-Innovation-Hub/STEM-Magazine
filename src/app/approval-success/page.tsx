'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function ApprovalSuccessContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) p-4">
      <div className="max-w-md w-full bg-(--card) border-2 border-(--border) rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-(--foreground) mb-4">
          Submission Approved!
        </h1>

        <p className="text-(--muted-foreground) mb-6">
          The post has been successfully approved and published. The author has
          been notified via email.
        </p>

        <div className="flex flex-col gap-3">
          {postId && (
            <Link
              href={`/posts/${postId}`}
              className="w-full px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              View Published Post
            </Link>
          )}
          <Link
            href="/posts"
            className="w-full px-6 py-3 bg-(--secondary) text-(--secondary-foreground) rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Browse All Posts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--background)">
          <div className="text-(--foreground)">Loading...</div>
        </div>
      }
    >
      <ApprovalSuccessContent />
    </Suspense>
  );
}

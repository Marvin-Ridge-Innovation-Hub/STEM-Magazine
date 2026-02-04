'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from '@/actions/submission.actions';
import {
  Target,
  Newspaper,
  Clock,
  CheckCircle,
  XCircle,
  List,
  BookOpen,
  LayoutGrid,
} from 'lucide-react';

// Helper components for consistent iconography
const PostTypeIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  switch (type) {
    case 'SM_EXPO':
      return <Target className={className} />;
    case 'SM_NOW':
      return <Newspaper className={className} />;
    default:
      return <LayoutGrid className={className} />;
  }
};

const StatusIcon = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  switch (status) {
    case 'PENDING':
      return <Clock className={className} />;
    case 'APPROVED':
      return <CheckCircle className={className} />;
    case 'REJECTED':
      return <XCircle className={className} />;
    default:
      return <Clock className={className} />;
  }
};

const getPostTypeColors = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'SM_NOW':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    default:
      return 'bg-gray-500/10 text-gray-600';
  }
};

const getStatusColors = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'REJECTED':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-600';
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'SM Expo';
    case 'SM_NOW':
      return 'SM Now';
    default:
      return type;
  }
};

interface Submission {
  id: string;
  postType: 'SM_EXPO' | 'SM_NOW';
  title: string;
  content: string;
  thumbnailUrl?: string;
  projectLinks: string[];
  sources?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  author: {
    id: string;
    email: string;
    name?: string;
  };
}

export default function ModeratorDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<
    'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  >('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/admin/check-role');
      const data = await response.json();

      if (data.authorized) {
        setAuthorized(true);
        loadSubmissions();
      } else {
        setAuthorized(false);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error) {
      console.error('Failed to check authorization:', error);
      setAuthorized(false);
      setTimeout(() => router.push('/'), 2000);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/submissions');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setActionLoading(submissionId);
    setMessage(null);

    try {
      const result = await approveSubmissionAction(submissionId);
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Submission approved successfully!',
        });
        loadSubmissions();
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to approve',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectionReason.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide a reason for rejection',
      });
      return;
    }

    setActionLoading(submissionId);
    setMessage(null);

    try {
      const result = await rejectSubmissionAction(
        submissionId,
        rejectionReason
      );
      if (result.success) {
        setMessage({ type: 'success', text: 'Submission rejected' });
        setRejectingId(null);
        setRejectionReason('');
        loadSubmissions();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reject' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubmissions = submissions.filter(
    (s) => filter === 'ALL' || s.status === filter
  );

  const stats = {
    pending: submissions.filter((s) => s.status === 'PENDING').length,
    approved: submissions.filter((s) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s) => s.status === 'REJECTED').length,
    total: submissions.length,
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      <motion.div
        className="bg-linear-to-br from-(--primary)/10 to-(--secondary)/10 border-b border-(--border)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🛡️ Moderator Dashboard
          </motion.h1>
          <motion.p
            className="text-(--muted-foreground)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Review and manage submission requests
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="bg-(--card) border border-(--border) rounded-lg p-4 text-center"
            variants={fadeIn}
            whileHover={{ y: -2 }}
          >
            <div className="text-3xl font-bold text-yellow-500">
              {stats.pending}
            </div>
            <div className="text-sm text-(--muted-foreground)">Pending</div>
          </motion.div>
          <motion.div
            className="bg-(--card) border border-(--border) rounded-lg p-4 text-center"
            variants={fadeIn}
            whileHover={{ y: -2 }}
          >
            <div className="text-3xl font-bold text-green-500">
              {stats.approved}
            </div>
            <div className="text-sm text-(--muted-foreground)">Approved</div>
          </motion.div>
          <motion.div
            className="bg-(--card) border border-(--border) rounded-lg p-4 text-center"
            variants={fadeIn}
            whileHover={{ y: -2 }}
          >
            <div className="text-3xl font-bold text-red-500">
              {stats.rejected}
            </div>
            <div className="text-sm text-(--muted-foreground)">Rejected</div>
          </motion.div>
          <motion.div
            className="bg-(--card) border border-(--border) rounded-lg p-4 text-center"
            variants={fadeIn}
            whileHover={{ y: -2 }}
          >
            <div className="text-3xl font-bold text-(--foreground)">
              {stats.total}
            </div>
            <div className="text-sm text-(--muted-foreground)">Total</div>
          </motion.div>
        </motion.div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                  : 'bg-red-500/10 border border-red-500/30 text-red-500'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <motion.div
          className="flex gap-2 mb-6 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-1 ${
                  filter === status
                    ? 'bg-(--primary) text-(--primary-foreground)'
                    : 'bg-(--card) border border-(--border) text-(--foreground) hover:border-(--primary)'
                }`}
              >
                {status === 'PENDING' && <Clock className="h-4 w-4" />}
                {status === 'APPROVED' && <CheckCircle className="h-4 w-4" />}
                {status === 'REJECTED' && <XCircle className="h-4 w-4" />}
                {status === 'ALL' && <List className="h-4 w-4" />}
                {status.charAt(0) + status.slice(1).toLowerCase()}
                {status !== 'ALL' &&
                  ` (${status === 'PENDING' ? stats.pending : status === 'APPROVED' ? stats.approved : stats.rejected})`}
              </button>
            )
          )}
        </motion.div>

        {/* Submissions List */}
        {authorized === false ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-(--foreground) mb-2">
              Access Denied
            </h2>
            <p className="text-(--muted-foreground) mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-(--muted-foreground)">
              Redirecting to home...
            </p>
          </motion.div>
        ) : authorized === null || loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-(--card) border border-(--border) rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-(--muted) rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-(--muted) rounded w-full mb-2"></div>
                <div className="h-4 bg-(--muted) rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-(--card) border border-(--border) rounded-lg">
            <p className="text-(--muted-foreground) text-lg">
              {filter === 'ALL'
                ? 'No submissions yet'
                : `No ${filter.toLowerCase()} submissions`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <motion.div
                key={submission.id}
                className="bg-(--card) border border-(--border) rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.2 }}
              >
                {/* Submission Header */}
                <div className="p-4 md:p-6 border-b border-(--border)">
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPostTypeColors(submission.postType)}`}
                        >
                          <PostTypeIcon
                            type={submission.postType}
                            className="h-3 w-3"
                          />
                          {getPostTypeLabel(submission.postType)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColors(submission.status)}`}
                        >
                          <StatusIcon
                            status={submission.status}
                            className="h-3 w-3"
                          />
                          {submission.status.charAt(0) +
                            submission.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-(--foreground) mb-1">
                        {submission.title}
                      </h3>
                      <p className="text-sm text-(--muted-foreground)">
                        By {submission.author.name || submission.author.email} •{' '}
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {submission.thumbnailUrl && (
                      <div className="relative w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden">
                        <Image
                          src={submission.thumbnailUrl}
                          alt={submission.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Content */}
                <div className="p-4 md:p-6 border-b border-(--border)">
                  <h4 className="font-semibold text-(--foreground) mb-2">
                    Content
                  </h4>
                  <p className="text-(--muted-foreground) whitespace-pre-wrap line-clamp-6">
                    {submission.content}
                  </p>
                </div>

                {/* Project Links / Sources */}
                {(submission.projectLinks.length > 0 || submission.sources) && (
                  <div className="p-4 md:p-6 border-b border-(--border) bg-(--muted)/30">
                    {submission.projectLinks.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-(--foreground) mb-2">
                          📎 Project Links
                        </h4>
                        <ul className="space-y-1">
                          {submission.projectLinks.map((link, idx) => (
                            <li key={idx}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-(--primary) hover:underline text-sm break-all"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {submission.sources && (
                      <div>
                        <h4 className="font-semibold text-(--foreground) mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" /> Sources
                        </h4>
                        <p className="text-sm text-(--muted-foreground) whitespace-pre-wrap">
                          {submission.sources}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {submission.status === 'PENDING' && (
                  <div className="p-4 md:p-6 bg-(--muted)/20">
                    {rejectingId === submission.id ? (
                      <div className="space-y-4">
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="w-full p-3 bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder-(--muted-foreground) resize-none"
                          rows={3}
                        />
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                            className="px-4 py-2 border border-(--border) rounded-lg hover:bg-(--muted) transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(submission.id)}
                            disabled={actionLoading === submission.id}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === submission.id
                              ? 'Rejecting...'
                              : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => handleApprove(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="px-4 md:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                        >
                          {actionLoading === submission.id ? (
                            'Approving...'
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" />{' '}
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setRejectingId(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="px-4 md:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 inline mr-1" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

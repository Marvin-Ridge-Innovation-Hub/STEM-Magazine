'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Target,
  Newspaper,
  Loader2,
  Bell,
  Send,
  ArrowRight,
  LayoutDashboard,
  Headphones,
  Eye,
  BookOpen,
  RotateCcw,
  Settings,
  Heart,
  MessageSquare,
  Mail,
  User,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyDrafts, deleteDraftAction } from '@/actions/draft.actions';
import {
  getMySubmissions,
  deleteSubmissionAction,
  moveToDraftAction,
} from '@/actions/submission.actions';

/**
 * Icon Mapping for Consistent Iconography:
 * - SM Expo = Target (blue)
 * - SM Now = Newspaper (purple)
 * - SM Pods = Headphones (red)
 * - Pending = Clock (amber)
 * - Approved = CheckCircle (green)
 * - Rejected = XCircle (red)
 * - Drafts = FileText
 * - Submissions = Send
 * - Newsletter = Bell
 */

const ALL_TAGS = [
  'health',
  'technology',
  'engineering',
  'mathematics',
  'environment',
  'biology',
  'chemistry',
  'physics',
  'computer-science',
  'ai',
];

interface Draft {
  id: string;
  postType?: 'SM_EXPO' | 'SM_NOW';
  title?: string;
  content?: string;
  thumbnailFile?: string;
  draftName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Submission {
  id: string;
  postType: 'SM_EXPO' | 'SM_NOW';
  title: string;
  content: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  canMoveToDraft: boolean;
  rejectionReason?: string;
  createdAt: Date;
  publishedAt?: Date;
}

interface NewsletterSubscription {
  subscribeExpo: boolean;
  subscribeNow: boolean;
  subscribePods: boolean;
  tags: string[];
  isActive: boolean;
}

interface NotificationPreferences {
  emailOnLike: boolean;
  emailOnComment: boolean;
  emailOnReply: boolean;
  emailOnApproval: boolean;
  emailOnRejection: boolean;
  emailEnabled: boolean;
}

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
    case 'SM_PODS':
      return <Headphones className={className} />;
    default:
      return <FileText className={className} />;
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

const getPostTypeColors = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'SM_NOW':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'SM_PODS':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-600';
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'Expo';
    case 'SM_NOW':
      return 'Now';
    case 'SM_PODS':
      return 'Pods';
    default:
      return type;
  }
};

export default function DashboardPage() {
  const { user } = useUser();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'drafts' | 'submissions' | 'newsletter' | 'notifications'
  >('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Newsletter state
  const [newsletter, setNewsletter] = useState<NewsletterSubscription>({
    subscribeExpo: false,
    subscribeNow: false,
    subscribePods: false,
    tags: [],
    isActive: false,
  });
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailOnLike: true,
    emailOnComment: true,
    emailOnReply: true,
    emailOnApproval: true,
    emailOnRejection: true,
    emailEnabled: true,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadNewsletter();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.preferences) {
        setNotifications(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const saveNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      });

      if (response.ok) {
        toast.success('Notification preferences saved!');
      } else {
        toast.error('Failed to save notification preferences');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadNewsletter = async () => {
    try {
      const response = await fetch('/api/newsletter', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.subscription) {
        setNewsletter({
          subscribeExpo: data.subscription.subscribeExpo,
          subscribeNow: data.subscription.subscribeNow,
          subscribePods: data.subscription.subscribePods,
          tags: data.subscription.tags || [],
          isActive: data.subscription.isActive,
        });
      }
    } catch (error) {
      console.error('Failed to load newsletter preferences:', error);
    }
  };

  const saveNewsletter = async () => {
    setNewsletterLoading(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribeExpo: newsletter.subscribeExpo,
          subscribeNow: newsletter.subscribeNow,
          subscribePods: newsletter.subscribePods,
          tags: newsletter.tags,
        }),
      });

      if (response.ok) {
        toast.success('Newsletter preferences saved!');
        setNewsletter((prev) => ({ ...prev, isActive: true }));
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save newsletter preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const toggleNewsletterTag = (tag: string) => {
    setNewsletter((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [draftsResult, submissionsResult] = await Promise.all([
        getMyDrafts(),
        getMySubmissions(),
      ]);

      if (draftsResult.success && draftsResult.drafts) {
        setDrafts(draftsResult.drafts as Draft[]);
      }
      if (submissionsResult.success && submissionsResult.submissions) {
        setSubmissions(submissionsResult.submissions as Submission[]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    setActionLoading(draftId);
    try {
      const result = await deleteDraftAction(draftId);
      if (result.success) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      }
    } catch (error) {
      console.error('Failed to delete draft:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSubmission = async (
    submissionId: string,
    isApproved: boolean = false
  ) => {
    const message = isApproved
      ? 'Are you sure you want to delete this submission? This will also remove the published post from the site.'
      : 'Are you sure you want to delete this submission?';

    if (!window.confirm(message)) return;

    setActionLoading(submissionId);
    try {
      const result = await deleteSubmissionAction(submissionId);
      if (result.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
        toast.success(
          isApproved ? 'Post removed from site' : 'Submission deleted'
        );
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast.error('Failed to delete submission');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoveToDraft = async (submissionId: string) => {
    setActionLoading(submissionId);
    try {
      const result = await moveToDraftAction(submissionId);
      if (result.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
        toast.success('Moved to drafts! You can edit and resubmit.');
        // Reload drafts to include the new one
        const draftsResult = await getMyDrafts();
        if (draftsResult.success && draftsResult.drafts) {
          setDrafts(draftsResult.drafts as Draft[]);
        }
      } else {
        toast.error(result.error || 'Failed to move to drafts');
      }
    } catch (error) {
      console.error('Failed to move to draft:', error);
      toast.error('Failed to move to drafts');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    totalDrafts: drafts.length,
    pending: submissions.filter((s) => s.status === 'PENDING').length,
    approved: submissions.filter((s) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s) => s.status === 'REJECTED').length,
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'drafts' as const,
      label: 'Drafts',
      icon: FileText,
      count: stats.totalDrafts,
    },
    {
      id: 'submissions' as const,
      label: 'Submissions',
      icon: Send,
      count: submissions.length,
    },
    { id: 'newsletter' as const, label: 'Newsletter', icon: Bell },
    { id: 'notifications' as const, label: 'Notifications', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-(--card) border-b border-(--border)">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar with user info and actions */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-(--primary) flex items-center justify-center text-(--primary-foreground) font-semibold">
                {user?.firstName?.[0] ||
                  user?.emailAddresses[0].emailAddress[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-(--foreground)">
                  {user?.firstName
                    ? `${user.firstName}'s Dashboard`
                    : 'Dashboard'}
                </h1>
                <p className="text-sm text-(--muted-foreground)">
                  Manage your content
                </p>
              </div>
              <h1 className="sm:hidden text-lg font-semibold text-(--foreground)">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-3 py-2 text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent) rounded-lg transition-colors text-sm"
                title="Edit Profile"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-3 py-2 text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent) rounded-lg transition-colors text-sm"
                title="Account Settings"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-(--primary) text-(--primary-foreground) rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Post</span>
              </Link>
              <SignOutButton>
                <button className="flex items-center gap-2 px-3 py-2 text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent) rounded-lg transition-colors text-sm">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-(--primary) text-(--primary)'
                      : 'border-transparent text-(--muted-foreground) hover:text-(--foreground) hover:border-(--border)'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                        isActive
                          ? 'bg-(--primary) text-(--primary-foreground)'
                          : 'bg-(--muted) text-(--muted-foreground)'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-(--card) p-4 sm:p-6 rounded-xl border border-(--border) animate-pulse"
                  >
                    <div className="h-10 w-10 bg-(--muted) rounded-lg mb-3"></div>
                    <div className="h-7 bg-(--muted) rounded w-12 mb-2"></div>
                    <div className="h-4 bg-(--muted) rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 },
                      },
                    }}
                  >
                    <motion.div
                      className="bg-(--card) p-4 sm:p-6 rounded-xl border border-(--border) cursor-pointer"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('drafts')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-(--foreground)">
                        {stats.totalDrafts}
                      </div>
                      <div className="text-sm text-(--muted-foreground)">
                        Drafts
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-(--card) p-4 sm:p-6 rounded-xl border border-(--border) cursor-pointer"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('submissions')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                        <Clock className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold text-(--foreground)">
                        {stats.pending}
                      </div>
                      <div className="text-sm text-(--muted-foreground)">
                        Pending
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-(--card) p-4 sm:p-6 rounded-xl border border-(--border) cursor-pointer"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('submissions')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold text-(--foreground)">
                        {stats.approved}
                      </div>
                      <div className="text-sm text-(--muted-foreground)">
                        Approved
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-(--card) p-4 sm:p-6 rounded-xl border border-(--border) cursor-pointer"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('submissions')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-(--foreground)">
                        {stats.rejected}
                      </div>
                      <div className="text-sm text-(--muted-foreground)">
                        Rejected
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Two Column Layout for Recent Items */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Drafts */}
                    <div className="bg-(--card) rounded-xl border border-(--border) overflow-hidden">
                      <div className="flex justify-between items-center p-4 sm:p-5 border-b border-(--border)">
                        <h3 className="font-semibold text-(--foreground) flex items-center gap-2">
                          <FileText className="h-5 w-5 text-(--muted-foreground)" />
                          Recent Drafts
                        </h3>
                        {drafts.length > 0 && (
                          <button
                            onClick={() => setActiveTab('drafts')}
                            className="text-sm text-(--primary) hover:underline flex items-center gap-1"
                          >
                            View all <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      {drafts.length === 0 ? (
                        <div className="p-6 text-center">
                          <FileText className="h-10 w-10 text-(--muted-foreground) mx-auto mb-2" />
                          <p className="text-sm text-(--muted-foreground)">
                            No drafts yet
                          </p>
                          <Link
                            href="/create"
                            className="text-sm text-(--primary) hover:underline mt-2 inline-block"
                          >
                            Create your first post
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-(--border)">
                          {drafts.slice(0, 3).map((draft) => (
                            <div
                              key={draft.id}
                              className="flex items-center justify-between p-4 hover:bg-(--accent)/50 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                {draft.postType && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium mb-1 ${getPostTypeColors(draft.postType)}`}
                                  >
                                    <PostTypeIcon
                                      type={draft.postType}
                                      className="h-3 w-3"
                                    />
                                    {getPostTypeLabel(draft.postType)}
                                  </span>
                                )}
                                <p className="font-medium text-(--foreground) truncate">
                                  {draft.title || draft.draftName}
                                </p>
                                <p className="text-xs text-(--muted-foreground)">
                                  {new Date(
                                    draft.updatedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Link
                                href={`/create?draftId=${draft.id}`}
                                className="ml-3 px-3 py-1.5 text-sm bg-(--primary) text-(--primary-foreground) rounded-lg hover:opacity-90 shrink-0"
                              >
                                Continue
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent Submissions */}
                    <div className="bg-(--card) rounded-xl border border-(--border) overflow-hidden">
                      <div className="flex justify-between items-center p-4 sm:p-5 border-b border-(--border)">
                        <h3 className="font-semibold text-(--foreground) flex items-center gap-2">
                          <Send className="h-5 w-5 text-(--muted-foreground)" />
                          Recent Submissions
                        </h3>
                        {submissions.length > 0 && (
                          <button
                            onClick={() => setActiveTab('submissions')}
                            className="text-sm text-(--primary) hover:underline flex items-center gap-1"
                          >
                            View all <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      {submissions.length === 0 ? (
                        <div className="p-6 text-center">
                          <Send className="h-10 w-10 text-(--muted-foreground) mx-auto mb-2" />
                          <p className="text-sm text-(--muted-foreground)">
                            No submissions yet
                          </p>
                          <Link
                            href="/create"
                            className="text-sm text-(--primary) hover:underline mt-2 inline-block"
                          >
                            Submit your first post
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-(--border)">
                          {submissions.slice(0, 3).map((submission) => (
                            <div
                              key={submission.id}
                              className="flex items-center gap-3 p-4 hover:bg-(--accent)/50 transition-colors"
                            >
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getStatusColors(submission.status)}`}
                              >
                                <StatusIcon
                                  status={submission.status}
                                  className="h-5 w-5"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getPostTypeColors(submission.postType)}`}
                                  >
                                    <PostTypeIcon
                                      type={submission.postType}
                                      className="h-3 w-3"
                                    />
                                    {getPostTypeLabel(submission.postType)}
                                  </span>
                                </div>
                                <p className="font-medium text-(--foreground) truncate">
                                  {submission.title}
                                </p>
                                <p className="text-xs text-(--muted-foreground)">
                                  {submission.status.toLowerCase()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'drafts' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-(--foreground)">
                        My Drafts
                      </h2>
                      <p className="text-sm text-(--muted-foreground)">
                        Continue working on your saved posts
                      </p>
                    </div>
                    <Link
                      href="/create"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-(--primary) text-(--primary-foreground) rounded-lg font-medium hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      New Draft
                    </Link>
                  </div>

                  {drafts.length === 0 ? (
                    <div className="text-center py-16 bg-(--card) border border-(--border) rounded-xl">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-(--muted) flex items-center justify-center">
                        <FileText className="h-8 w-8 text-(--muted-foreground)" />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground) mb-2">
                        No drafts yet
                      </h3>
                      <p className="text-(--muted-foreground) mb-6 max-w-sm mx-auto">
                        Start writing your first post and save it as a draft to
                        continue later.
                      </p>
                      <Link
                        href="/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg font-semibold hover:opacity-90"
                      >
                        <Plus className="h-4 w-4" />
                        Create your first post
                      </Link>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.08 },
                        },
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        {drafts.map((draft) => (
                          <motion.div
                            key={draft.id}
                            layout
                            className="bg-(--card) border border-(--border) rounded-xl overflow-hidden group"
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.95,
                              transition: { duration: 0.2 },
                            }}
                            whileHover={{
                              y: -4,
                              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="p-4 sm:p-5">
                              {draft.postType && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mb-3 ${getPostTypeColors(draft.postType)}`}
                                >
                                  <PostTypeIcon
                                    type={draft.postType}
                                    className="h-3 w-3"
                                  />
                                  {getPostTypeLabel(draft.postType)}
                                </span>
                              )}
                              <h3 className="font-semibold text-(--foreground) mb-2 line-clamp-1">
                                {draft.title || draft.draftName}
                              </h3>
                              {draft.content && (
                                <p className="text-sm text-(--muted-foreground) line-clamp-2 mb-4">
                                  {draft.content}
                                </p>
                              )}
                              <div className="flex justify-between items-center pt-3 border-t border-(--border)">
                                <span className="text-xs text-(--muted-foreground)">
                                  {new Date(
                                    draft.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                                <div className="flex gap-1">
                                  <Link
                                    href={`/create?draftId=${draft.id}`}
                                    className="p-2 text-(--primary) hover:bg-(--primary)/10 rounded-lg transition-colors"
                                    title="Edit draft"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteDraft(draft.id)}
                                    disabled={actionLoading === draft.id}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete draft"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-(--foreground)">
                      My Submissions
                    </h2>
                    <p className="text-sm text-(--muted-foreground)">
                      Track the status of your submitted posts
                    </p>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-16 bg-(--card) border border-(--border) rounded-xl">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-(--muted) flex items-center justify-center">
                        <Send className="h-8 w-8 text-(--muted-foreground)" />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground) mb-2">
                        No submissions yet
                      </h3>
                      <p className="text-(--muted-foreground) mb-6 max-w-sm mx-auto">
                        Submit your post for review to get it published on the
                        site.
                      </p>
                      <Link
                        href="/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg font-semibold hover:opacity-90"
                      >
                        <Plus className="h-4 w-4" />
                        Submit your first post
                      </Link>
                    </div>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.1 },
                        },
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        {submissions.map((submission) => (
                          <motion.div
                            key={submission.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              x: -100,
                              transition: { duration: 0.2 },
                            }}
                            className="bg-(--card) border border-(--border) rounded-xl overflow-hidden"
                            whileHover={{
                              y: -2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                          >
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                              {submission.thumbnailUrl && (
                                <div className="relative w-full sm:w-28 h-36 sm:h-20 rounded-lg overflow-hidden shrink-0">
                                  <Image
                                    src={submission.thumbnailUrl}
                                    alt={submission.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getPostTypeColors(submission.postType)}`}
                                  >
                                    <PostTypeIcon
                                      type={submission.postType}
                                      className="h-3 w-3"
                                    />
                                    {getPostTypeLabel(submission.postType)}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColors(submission.status)}`}
                                  >
                                    <StatusIcon
                                      status={submission.status}
                                      className="h-3 w-3"
                                    />
                                    {submission.status.charAt(0) +
                                      submission.status.slice(1).toLowerCase()}
                                  </span>
                                  <span className="text-xs text-(--muted-foreground) ml-auto hidden sm:inline">
                                    {new Date(
                                      submission.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-(--foreground) mb-1">
                                  {submission.title}
                                </h3>
                                <p className="text-sm text-(--muted-foreground) line-clamp-2">
                                  {submission.content}
                                </p>

                                {submission.status === 'REJECTED' &&
                                  submission.rejectionReason && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400"
                                    >
                                      <strong className="font-medium">
                                        Feedback:
                                      </strong>{' '}
                                      {submission.rejectionReason}
                                    </motion.div>
                                  )}

                                {submission.status === 'APPROVED' && (
                                  <Link
                                    href={`/posts/${submission.id}`}
                                    className="inline-flex items-center gap-1 mt-3 text-sm text-(--primary) hover:underline font-medium"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View published post
                                  </Link>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex sm:flex-col gap-2 justify-end items-center sm:items-end shrink-0">
                                <span className="text-xs text-(--muted-foreground) sm:hidden mr-auto">
                                  {new Date(
                                    submission.createdAt
                                  ).toLocaleDateString()}
                                </span>

                                {/* Pending: Just delete */}
                                {submission.status === 'PENDING' && (
                                  <button
                                    onClick={() =>
                                      handleDeleteSubmission(submission.id)
                                    }
                                    disabled={actionLoading === submission.id}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Withdraw submission"
                                  >
                                    {actionLoading === submission.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                )}

                                {/* Rejected: Move to draft or delete */}
                                {submission.status === 'REJECTED' && (
                                  <div className="flex gap-1">
                                    {submission.canMoveToDraft && (
                                      <button
                                        onClick={() =>
                                          handleMoveToDraft(submission.id)
                                        }
                                        disabled={
                                          actionLoading === submission.id
                                        }
                                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                                        title="Edit and resubmit"
                                      >
                                        {actionLoading === submission.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <RotateCcw className="h-4 w-4" />
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleDeleteSubmission(submission.id)
                                      }
                                      disabled={actionLoading === submission.id}
                                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                      title="Delete submission"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}

                                {/* Approved: Delete (removes from site) */}
                                {submission.status === 'APPROVED' && (
                                  <button
                                    onClick={() =>
                                      handleDeleteSubmission(
                                        submission.id,
                                        true
                                      )
                                    }
                                    disabled={actionLoading === submission.id}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Remove from site"
                                  >
                                    {actionLoading === submission.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'newsletter' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-(--foreground)">
                        Newsletter Preferences
                      </h2>
                      <p className="text-sm text-(--muted-foreground) mt-1">
                        Get notified when new posts matching your interests are
                        published.
                      </p>
                    </div>
                    {newsletter.isActive && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium w-fit">
                        <CheckCircle className="h-4 w-4" /> Subscribed
                      </span>
                    )}
                  </div>

                  {/* Post Type Subscriptions */}
                  <div className="bg-(--card) border border-(--border) rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-(--foreground) mb-2 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-(--muted-foreground)" />
                      Post Types
                    </h3>
                    <p className="text-sm text-(--muted-foreground) mb-4">
                      Choose which types of posts you want to receive
                      notifications for:
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <input
                          type="checkbox"
                          checked={newsletter.subscribeExpo}
                          onChange={(e) =>
                            setNewsletter((prev) => ({
                              ...prev,
                              subscribeExpo: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Target className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              SM Expo
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              Project showcases and exhibitions
                            </p>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <input
                          type="checkbox"
                          checked={newsletter.subscribeNow}
                          onChange={(e) =>
                            setNewsletter((prev) => ({
                              ...prev,
                              subscribeNow: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                            <Newspaper className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              SM Now
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              News and articles
                            </p>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <input
                          type="checkbox"
                          checked={newsletter.subscribePods}
                          onChange={(e) =>
                            setNewsletter((prev) => ({
                              ...prev,
                              subscribePods: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                            <Headphones className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              SM Pods
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              Podcast episodes
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Tag Preferences */}
                  <div className="bg-(--card) border border-(--border) rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold text-(--foreground) mb-4">
                      Topics of Interest
                    </h3>
                    <p className="text-sm text-(--muted-foreground) mb-4">
                      Select tags you&apos;re interested in. Leave empty to
                      receive all posts of your subscribed types.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleNewsletterTag(tag)}
                          className={`px-3 py-2 text-sm rounded-lg font-medium capitalize transition-all ${
                            newsletter.tags.includes(tag)
                              ? 'bg-(--accent) text-(--accent-foreground) shadow-md'
                              : 'bg-(--muted) text-(--muted-foreground) hover:bg-(--accent) hover:text-(--foreground)'
                          }`}
                        >
                          {tag.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                    {newsletter.tags.length > 0 && (
                      <p className="mt-4 text-sm text-(--muted-foreground)">
                        <span className="font-medium text-(--foreground)">
                          {newsletter.tags.length}
                        </span>{' '}
                        tag{newsletter.tags.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2">
                    {!newsletter.subscribeExpo &&
                    !newsletter.subscribeNow &&
                    !newsletter.subscribePods ? (
                      <p className="text-sm text-(--muted-foreground)">
                        Select at least one post type to subscribe to the
                        newsletter.
                      </p>
                    ) : (
                      <p className="text-sm text-(--muted-foreground)">
                        You&apos;ll receive email notifications for new posts
                        matching your preferences.
                      </p>
                    )}
                    <button
                      onClick={saveNewsletter}
                      disabled={
                        newsletterLoading ||
                        (!newsletter.subscribeExpo &&
                          !newsletter.subscribeNow &&
                          !newsletter.subscribePods)
                      }
                      className="w-full sm:w-auto px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {newsletterLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-(--foreground)">
                        Notification Settings
                      </h2>
                      <p className="text-sm text-(--muted-foreground) mt-1">
                        Control when you receive email notifications about your
                        posts and interactions.
                      </p>
                    </div>
                    {notifications.emailEnabled && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium w-fit">
                        <Mail className="h-4 w-4" /> Emails Enabled
                      </span>
                    )}
                  </div>

                  {/* Master Toggle */}
                  <div className="bg-(--card) border border-(--border) rounded-xl p-4 sm:p-6">
                    <label className="flex items-center justify-between gap-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-(--primary)/10 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-(--primary)" />
                        </div>
                        <div>
                          <span className="font-semibold text-(--foreground)">
                            Email Notifications
                          </span>
                          <p className="text-sm text-(--muted-foreground)">
                            Master toggle for all email notifications
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={notifications.emailEnabled}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailEnabled: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-(--muted) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary)"></div>
                      </div>
                    </label>
                  </div>

                  {/* Notification Types */}
                  <div
                    className={`bg-(--card) border border-(--border) rounded-xl p-4 sm:p-6 transition-opacity ${!notifications.emailEnabled ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <h3 className="font-semibold text-(--foreground) mb-2 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-(--muted-foreground)" />
                      Notification Types
                    </h3>
                    <p className="text-sm text-(--muted-foreground) mb-4">
                      Choose which activities you want to be notified about:
                    </p>
                    <div className="space-y-3">
                      {/* Likes */}
                      <label className="flex items-center justify-between gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                            <Heart className="h-5 w-5 text-pink-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              Likes
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              When someone likes your post
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailOnLike}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailOnLike: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                      </label>

                      {/* Comments */}
                      <label className="flex items-center justify-between gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              Comments
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              When someone comments on your post
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailOnComment}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailOnComment: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                      </label>

                      {/* Replies */}
                      <label className="flex items-center justify-between gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-5 w-5 text-cyan-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              Replies
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              When someone replies to your comment
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailOnReply}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailOnReply: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submission Status Notifications */}
                  <div
                    className={`bg-(--card) border border-(--border) rounded-xl p-4 sm:p-6 transition-opacity ${!notifications.emailEnabled ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <h3 className="font-semibold text-(--foreground) mb-2 flex items-center gap-2">
                      <Send className="h-5 w-5 text-(--muted-foreground)" />
                      Submission Updates
                    </h3>
                    <p className="text-sm text-(--muted-foreground) mb-4">
                      Get notified about your submission review status:
                    </p>
                    <div className="space-y-3">
                      {/* Approval */}
                      <label className="flex items-center justify-between gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              Approvals
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              When your submission is approved
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailOnApproval}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailOnApproval: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                      </label>

                      {/* Rejection */}
                      <label className="flex items-center justify-between gap-3 p-4 bg-(--background) rounded-xl cursor-pointer hover:bg-(--accent) transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                            <XCircle className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <span className="font-medium text-(--foreground)">
                              Rejections
                            </span>
                            <p className="text-xs text-(--muted-foreground)">
                              When your submission is rejected
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailOnRejection}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              emailOnRejection: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 rounded border-2 border-(--border) accent-(--primary)"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2">
                    <p className="text-sm text-(--muted-foreground)">
                      {notifications.emailEnabled
                        ? "You'll receive emails based on your selected preferences."
                        : 'All email notifications are currently disabled.'}
                    </p>
                    <button
                      onClick={saveNotifications}
                      disabled={notificationsLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {notificationsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

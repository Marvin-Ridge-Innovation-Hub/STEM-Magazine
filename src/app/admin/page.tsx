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
  Youtube,
  Plus,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  RefreshCw,
  Shield,
  FileText,
  Headphones,
  Search,
  Users,
  Ban,
  UserCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Tab types
type AdminTab = 'submissions' | 'pods' | 'posts' | 'users';

// Helper components
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
    case 'SM_PODS':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
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
    case 'SM_PODS':
      return 'SM Pods';
    default:
      return type;
  }
};

const AVAILABLE_TAGS = [
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
  'interview',
  'discussion',
];

interface Submission {
  id: string;
  postType: 'SM_EXPO' | 'SM_NOW';
  title: string;
  content: string;
  thumbnailUrl?: string;
  images: string[];
  projectLinks: string[];
  sources?: string;
  tags: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  canMoveToDraft: boolean;
  createdAt: string;
  author: {
    id: string;
    email: string;
    name?: string;
  };
}

interface Pod {
  id: string;
  title: string;
  content: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  status: string;
  publishedAt: string;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    email: string;
  };
}

interface Post {
  id: string;
  title: string;
  postType: string;
  thumbnailUrl?: string;
  coverImage?: string;
  publishedAt: string;
  author: {
    id: string;
    name?: string;
    email: string;
  };
  likeCount: number;
  commentCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [filter, setFilter] = useState<
    'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  >('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [allowMoveToDraft, setAllowMoveToDraft] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Pods state
  const [pods, setPods] = useState<Pod[]>([]);
  const [podsLoading, setPodsLoading] = useState(true);
  const [showPodForm, setShowPodForm] = useState(false);
  const [podSubmitting, setPodSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deletingPodId, setDeletingPodId] = useState<string | null>(null);
  const [podFormData, setPodFormData] = useState({
    title: '',
    content: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    tags: [] as string[],
  });

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postSearch, setPostSearch] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState<string>('ALL');

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      if (activeTab === 'submissions') loadSubmissions();
      else if (activeTab === 'pods') loadPods();
      else if (activeTab === 'posts') loadPosts();
      else if (activeTab === 'users') loadUsers();
    }
  }, [activeTab, authorized]);

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

  // ==================== SUBMISSIONS ====================
  const loadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await fetch('/api/admin/submissions');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setActionLoading(submissionId);
    setMessage(null);

    try {
      const result = await approveSubmissionAction(submissionId);
      if (result.success) {
        toast.success('Submission approved successfully!');
        // Immediately update the UI by refetching submissions
        await loadSubmissions();
      } else {
        toast.error(result.error || 'Failed to approve');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(submissionId);

    try {
      const result = await rejectSubmissionAction(
        submissionId,
        rejectionReason,
        allowMoveToDraft
      );
      if (result.success) {
        toast.success(result.message || 'Submission rejected');
        setRejectingId(null);
        setRejectionReason('');
        setAllowMoveToDraft(true);
        // Immediately update the UI by refetching submissions
        await loadSubmissions();
      } else {
        toast.error(result.error || 'Failed to reject');
      }
    } catch (error) {
      toast.error('An error occurred');
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

  // ==================== PODS ====================
  const loadPods = async () => {
    try {
      setPodsLoading(true);
      const response = await fetch('/api/admin/pods');
      const data = await response.json();
      if (data.success) {
        setPods(data.pods);
      }
    } catch (error) {
      console.error('Failed to load pods:', error);
      toast.error('Failed to load SM Pods');
    } finally {
      setPodsLoading(false);
    }
  };

  const handleSyncFromYouTube = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/pods/sync');
      const data = await response.json();

      if (data.success) {
        if (data.newPodsCreated > 0) {
          toast.success(
            `Synced ${data.newPodsCreated} new videos from YouTube!`
          );
          loadPods();
        } else {
          toast.success('Already up to date! No new videos found.');
        }
      } else {
        toast.error(data.error || 'Failed to sync from YouTube');
      }
    } catch (error) {
      toast.error('Failed to sync from YouTube');
    } finally {
      setSyncing(false);
    }
  };

  const handlePodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPodSubmitting(true);

    try {
      const response = await fetch('/api/admin/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(podFormData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('SM Pod created successfully!');
        setPodFormData({
          title: '',
          content: '',
          youtubeUrl: '',
          thumbnailUrl: '',
          tags: [],
        });
        setShowPodForm(false);
        loadPods();
      } else {
        toast.error(data.error || 'Failed to create SM Pod');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setPodSubmitting(false);
    }
  };

  const handleDeletePod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SM Pod?')) return;

    setDeletingPodId(id);
    try {
      const response = await fetch(`/api/admin/pods?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('SM Pod deleted successfully');
        loadPods();
      } else {
        toast.error(data.error || 'Failed to delete SM Pod');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setDeletingPodId(null);
    }
  };

  const togglePodTag = (tag: string) => {
    setPodFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // ==================== POSTS ====================
  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch('/api/admin/posts');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This will also delete all comments and remove images from storage.`
      )
    )
      return;

    setDeletingPostId(id);
    try {
      const response = await fetch(`/api/admin/posts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Post deleted successfully');
        loadPosts();
      } else {
        toast.error(data.error || 'Failed to delete post');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setDeletingPostId(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      postSearch === '' ||
      post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.author.name?.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.author.email.toLowerCase().includes(postSearch.toLowerCase());
    const matchesType =
      postTypeFilter === 'ALL' || post.postType === postTypeFilter;
    return matchesSearch && matchesType;
  });

  // ==================== USERS ====================
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to ban this user? They will not be able to sign in.'
      )
    )
      return;

    setBanningUserId(userId);
    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User banned successfully');
        loadUsers();
      } else {
        toast.error(data.error || 'Failed to ban user');
      }
    } catch (error) {
      toast.error('Failed to ban user');
    } finally {
      setBanningUserId(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setBanningUserId(userId);
    try {
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User unbanned successfully');
        loadUsers();
      } else {
        toast.error(data.error || 'Failed to unban user');
      }
    } catch (error) {
      toast.error('Failed to unban user');
    } finally {
      setBanningUserId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ==================== RENDER ====================
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
          <span className="text-(--foreground)">Checking authorization...</span>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2 text-(--foreground)">
            Access Denied
          </h1>
          <p className="text-(--muted-foreground)">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm mt-2 text-(--muted-foreground)">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      <div className="bg-linear-to-br from-(--primary)/10 to-(--secondary)/10 border-b border-(--border)">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-(--primary)">
              <Shield className="h-6 w-6 text-(--primary-foreground)" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-(--foreground)">
                Admin Dashboard
              </h1>
              <p className="text-(--muted-foreground) text-sm">
                Manage submissions, podcasts, and published posts
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-(--primary) text-(--primary-foreground)'
                  : 'bg-(--card) border border-(--border) text-(--foreground) hover:border-(--primary)'
              }`}
            >
              <FileText className="h-4 w-4" />
              Submissions
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pods')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'pods'
                  ? 'bg-(--primary) text-(--primary-foreground)'
                  : 'bg-(--card) border border-(--border) text-(--foreground) hover:border-(--primary)'
              }`}
            >
              <Youtube className="h-4 w-4" />
              SM Pods
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'posts'
                  ? 'bg-(--primary) text-(--primary-foreground)'
                  : 'bg-(--card) border border-(--border) text-(--foreground) hover:border-(--primary)'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Manage Posts
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-(--primary) text-(--primary-foreground)'
                  : 'bg-(--card) border border-(--border) text-(--foreground) hover:border-(--primary)'
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ==================== SUBMISSIONS TAB ==================== */}
        {activeTab === 'submissions' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-(--card) border border-(--border) rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {stats.pending}
                </div>
                <div className="text-sm text-(--muted-foreground)">Pending</div>
              </div>
              <div className="bg-(--card) border border-(--border) rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-500">
                  {stats.approved}
                </div>
                <div className="text-sm text-(--muted-foreground)">
                  Approved
                </div>
              </div>
              <div className="bg-(--card) border border-(--border) rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-500">
                  {stats.rejected}
                </div>
                <div className="text-sm text-(--muted-foreground)">
                  Rejected
                </div>
              </div>
              <div className="bg-(--card) border border-(--border) rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-(--foreground)">
                  {stats.total}
                </div>
                <div className="text-sm text-(--muted-foreground)">Total</div>
              </div>
            </div>

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
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-1 ${
                      filter === status
                        ? 'bg-(--accent) text-(--accent-foreground) shadow-md'
                        : 'bg-(--card) border border-(--border) text-(--foreground) hover:border-(--primary)'
                    }`}
                  >
                    {status === 'PENDING' && <Clock className="h-4 w-4" />}
                    {status === 'APPROVED' && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {status === 'REJECTED' && <XCircle className="h-4 w-4" />}
                    {status === 'ALL' && <List className="h-4 w-4" />}
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                    {status !== 'ALL' &&
                      ` (${status === 'PENDING' ? stats.pending : status === 'APPROVED' ? stats.approved : stats.rejected})`}
                  </button>
                )
              )}
            </div>

            {/* Submissions List */}
            {submissionsLoading ? (
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
                  >
                    {/* Header */}
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
                            By{' '}
                            {submission.author.name || submission.author.email}{' '}
                            •{' '}
                            {new Date(
                              submission.createdAt
                            ).toLocaleDateString()}
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

                    {/* Content */}
                    <div className="p-4 md:p-6 border-b border-(--border)">
                      <h4 className="font-semibold text-(--foreground) mb-2">
                        Content
                      </h4>
                      <p className="text-(--muted-foreground) whitespace-pre-wrap line-clamp-6">
                        {submission.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {submission.tags && submission.tags.length > 0 && (
                      <div className="p-4 md:p-6 border-b border-(--border) bg-(--muted)/20">
                        <h4 className="font-semibold text-(--foreground) mb-3">
                          🏷️ Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {submission.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-(--accent) text-(--accent-foreground)"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images for SM Expo */}
                    {submission.postType === 'SM_EXPO' &&
                      submission.images &&
                      submission.images.length > 0 && (
                        <div className="p-4 md:p-6 border-b border-(--border)">
                          <h4 className="font-semibold text-(--foreground) mb-3">
                            🖼️ Project Images ({submission.images.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {submission.images.map((image, idx) => (
                              <a
                                key={idx}
                                href={image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-video rounded-lg overflow-hidden border border-(--border) hover:opacity-80 transition-opacity group"
                              >
                                <Image
                                  src={image}
                                  alt={`Project image ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Links/Sources */}
                    {(submission.projectLinks.length > 0 ||
                      submission.sources) && (
                      <div className="p-4 md:p-6 border-b border-(--border) bg-(--muted)/30">
                        {submission.projectLinks.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-(--foreground) mb-3 flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" /> Project Links
                              ({submission.projectLinks.length})
                            </h4>
                            <ul className="space-y-2">
                              {submission.projectLinks.map((link, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-(--muted-foreground) text-sm mt-0.5">
                                    {idx + 1}.
                                  </span>
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-(--primary) hover:underline text-sm break-all flex-1 inline-flex items-center gap-1"
                                  >
                                    {link}
                                    <ExternalLink className="h-3 w-3 shrink-0" />
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
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                              placeholder="Reason for rejection..."
                              className="w-full p-3 bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder-(--muted-foreground) resize-none"
                              rows={3}
                            />
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={allowMoveToDraft}
                                onChange={(e) =>
                                  setAllowMoveToDraft(e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-(--foreground)">
                                Allow author to move to drafts (shows button in
                                their dashboard to revise and resubmit)
                              </span>
                            </label>
                            <div className="flex gap-3 flex-wrap">
                              <button
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectionReason('');
                                  setAllowMoveToDraft(true);
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
          </motion.div>
        )}

        {/* ==================== PODS TAB ==================== */}
        {activeTab === 'pods' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Actions */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button
                onClick={handleSyncFromYouTube}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-(--accent) text-(--accent-foreground) hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`}
                />
                {syncing ? 'Syncing...' : 'Sync from YouTube'}
              </button>
              <button
                onClick={() => setShowPodForm(!showPodForm)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  showPodForm
                    ? 'bg-(--muted) text-(--foreground)'
                    : 'bg-(--primary) text-(--primary-foreground)'
                }`}
              >
                {showPodForm ? (
                  <>
                    <X className="h-5 w-5" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" /> Add Manually
                  </>
                )}
              </button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
              {showPodForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePodSubmit}
                  className="bg-(--card) border border-(--border) rounded-lg mb-8 p-6 space-y-6 overflow-hidden"
                >
                  <h2 className="text-xl font-bold text-(--foreground)">
                    Add New SM Pod
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                      Episode Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={podFormData.title}
                      onChange={(e) =>
                        setPodFormData({
                          ...podFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground)"
                      placeholder="e.g., Episode 12: The Future of AI"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={podFormData.youtubeUrl}
                      onChange={(e) =>
                        setPodFormData({
                          ...podFormData,
                          youtubeUrl: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground)"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={podFormData.content}
                      onChange={(e) =>
                        setPodFormData({
                          ...podFormData,
                          content: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) resize-none"
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => togglePodTag(tag)}
                          className={`px-3 py-1.5 text-xs rounded-full font-medium capitalize transition-all ${podFormData.tags.includes(tag) ? 'bg-(--accent) text-(--accent-foreground)' : 'bg-(--muted) text-(--foreground)'}`}
                        >
                          {tag.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={podSubmitting}
                    className="w-full h-12 rounded-lg px-8 font-semibold bg-(--primary) text-(--primary-foreground) hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {podSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        <Youtube className="w-5 h-5" /> Create SM Pod
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Pods List */}
            {podsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-(--card) border border-(--border) rounded-lg p-4 animate-pulse"
                  >
                    <div className="aspect-video rounded-lg mb-4 bg-(--muted)" />
                    <div className="h-6 rounded w-3/4 mb-2 bg-(--muted)" />
                    <div className="h-4 rounded w-1/2 bg-(--muted)" />
                  </div>
                ))}
              </div>
            ) : pods.length === 0 ? (
              <div className="text-center py-16">
                <Youtube className="h-16 w-16 mx-auto mb-4 text-(--muted-foreground)" />
                <h2 className="text-xl font-bold mb-2 text-(--foreground)">
                  No SM Pods Yet
                </h2>
                <p className="text-(--muted-foreground)">
                  Add your first podcast episode from YouTube.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pods.map((pod) => (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-(--card) border border-(--border) rounded-lg overflow-hidden group"
                  >
                    <div className="relative aspect-video">
                      {pod.thumbnailUrl ? (
                        <Image
                          src={pod.thumbnailUrl}
                          alt={pod.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-(--muted)">
                          <Youtube className="h-12 w-12 text-(--muted-foreground)" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <a
                          href={pod.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <ExternalLink className="h-5 w-5 text-white" />
                        </a>
                        <button
                          onClick={() => handleDeletePod(pod.id)}
                          disabled={deletingPodId === pod.id}
                          className="p-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                        >
                          {deletingPodId === pod.id ? (
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg line-clamp-2 mb-2 text-(--foreground)">
                        {pod.title}
                      </h3>
                      {pod.content && (
                        <p className="text-sm line-clamp-2 mb-3 text-(--muted-foreground)">
                          {pod.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-(--muted-foreground)">
                          {formatDate(pod.publishedAt || pod.createdAt)}
                        </span>
                        {pod.tags.length > 0 && (
                          <div className="flex gap-1">
                            {pod.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded-full capitalize bg-(--muted) text-(--muted-foreground)"
                              >
                                {tag.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== POSTS TAB ==================== */}
        {activeTab === 'posts' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-(--foreground) mb-2">
                Manage Published Posts
              </h2>
              <p className="text-(--muted-foreground) text-sm">
                Delete any published post. This will also remove all comments
                and images.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--muted-foreground)" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Search by title or author..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground)"
                />
              </div>
              <div className="flex gap-2">
                {['ALL', 'SM_EXPO', 'SM_NOW', 'SM_PODS'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPostTypeFilter(type)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      postTypeFilter === type
                        ? 'bg-(--accent) text-(--accent-foreground) shadow-md'
                        : 'bg-(--muted) text-(--foreground) hover:bg-(--muted)/80'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : getPostTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List */}
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-(--card) border border-(--border) rounded-lg p-4 animate-pulse flex items-center gap-4"
                  >
                    <div className="w-20 h-14 rounded bg-(--muted)" />
                    <div className="flex-1">
                      <div className="h-5 rounded w-1/2 mb-2 bg-(--muted)" />
                      <div className="h-4 rounded w-1/4 bg-(--muted)" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-(--card) border border-(--border) rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-(--muted-foreground)" />
                <p className="text-(--muted-foreground) text-lg">
                  No posts found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-(--card) border border-(--border) rounded-lg p-4 flex items-center gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-(--muted)">
                      {post.thumbnailUrl || post.coverImage ? (
                        <Image
                          src={post.thumbnailUrl || post.coverImage || ''}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PostTypeIcon
                            type={post.postType}
                            className="h-6 w-6 text-(--muted-foreground)"
                          />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getPostTypeColors(post.postType)}`}
                        >
                          <PostTypeIcon
                            type={post.postType}
                            className="h-3 w-3"
                          />
                          {getPostTypeLabel(post.postType)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-(--foreground) truncate">
                        {post.title}
                      </h3>
                      <p className="text-sm text-(--muted-foreground)">
                        By {post.author.name || post.author.email} •{' '}
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-sm text-(--muted-foreground)">
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      disabled={deletingPostId === post.id}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {deletingPostId === post.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== USERS TAB ==================== */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--muted-foreground)" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-(--background) border border-(--border) rounded-lg text-(--foreground) placeholder-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
              </div>
            </div>

            {/* Users List */}
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-(--card) border border-(--border) rounded-lg animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-full bg-(--muted)" />
                    <div className="flex-1">
                      <div className="h-5 rounded w-1/3 mb-2 bg-(--muted)" />
                      <div className="h-4 rounded w-1/4 bg-(--muted)" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-(--card) border border-(--border) rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-(--muted-foreground)" />
                <p className="text-(--muted-foreground) text-lg">
                  No users found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-(--card) border border-(--border) rounded-lg hover:border-(--primary) transition-all"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* User Avatar */}
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.name || 'User'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-(--primary) flex items-center justify-center text-(--primary-foreground) font-bold text-lg">
                        {user.name?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase() ||
                          'U'}
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-(--foreground) truncate">
                          {user.name || 'Unnamed User'}
                        </h3>
                        {user.banned && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-500 font-medium">
                            Banned
                          </span>
                        )}
                        {user.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-500 font-medium">
                            Admin
                          </span>
                        )}
                        {user.role === 'MODERATOR' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500 font-medium">
                            Moderator
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-(--muted-foreground) truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Ban/Unban Button */}
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() =>
                          user.banned
                            ? handleUnbanUser(user.clerkId)
                            : handleBanUser(user.clerkId)
                        }
                        disabled={banningUserId === user.clerkId}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          user.banned
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        {banningUserId === user.clerkId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.banned ? (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4" />
                            Ban
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

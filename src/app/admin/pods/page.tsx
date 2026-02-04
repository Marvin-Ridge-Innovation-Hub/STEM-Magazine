'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube,
  Plus,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

export default function SMPodsManagement() {
  const router = useRouter();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    tags: [] as string[],
  });

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/admin/check-role', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.authorized) {
        setAuthorized(true);
        loadPods();
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

  const loadPods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pods', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        setPods(data.pods);
      }
    } catch (error) {
      console.error('Failed to load pods:', error);
      toast.error('Failed to load SM Pods');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromYouTube = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/pods/sync', {
        cache: 'no-store',
      });
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
        if (data.hint) {
          console.info('Hint:', data.hint);
        }
      }
    } catch (error) {
      toast.error('Failed to sync from YouTube');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('SM Pod created successfully!');
        setFormData({
          title: '',
          content: '',
          youtubeUrl: '',
          thumbnailUrl: '',
          tags: [],
        });
        setShowForm(false);
        loadPods();
      } else {
        toast.error(data.error || 'Failed to create SM Pod');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SM Pod?')) return;

    setDeletingId(id);
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
      setDeletingId(null);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authorized === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="flex items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: 'var(--primary)' }}
          />
          <span style={{ color: 'var(--foreground)' }}>
            Checking authorization...
          </span>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Access Denied
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            You don't have permission to access this page.
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Youtube
                  className="h-6 w-6"
                  style={{ color: 'var(--primary-foreground)' }}
                />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  SM Pods Management
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Syncs automatically from your YouTube channel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncFromYouTube}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                }}
              >
                <RefreshCw
                  className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`}
                />
                {syncing ? 'Syncing...' : 'Sync from YouTube'}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: showForm ? 'var(--muted)' : 'var(--primary)',
                  color: showForm
                    ? 'var(--foreground)'
                    : 'var(--primary-foreground)',
                }}
              >
                {showForm ? (
                  <>
                    <X className="h-5 w-5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Add Manually
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="card mb-8 p-6 space-y-6 overflow-hidden"
            >
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Add New SM Pod
              </h2>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Episode Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--input)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="e.g., Episode 12: The Future of AI in Healthcare"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  YouTube URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--input)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Supports youtube.com/watch, youtube.com/embed, and youtu.be
                  links
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border transition-all resize-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--input)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="Brief description of this episode..."
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Custom Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--input)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="Leave empty to use YouTube thumbnail"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 text-xs rounded-full font-medium capitalize transition-all"
                      style={{
                        backgroundColor: formData.tags.includes(tag)
                          ? 'var(--primary)'
                          : 'var(--muted)',
                        color: formData.tags.includes(tag)
                          ? 'var(--primary-foreground)'
                          : 'var(--foreground)',
                      }}
                    >
                      {tag.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center h-12 rounded-lg px-8 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    'linear-gradient(to right, var(--primary), var(--accent))',
                  color: 'var(--primary-foreground)',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Youtube className="w-5 h-5 mr-2" />
                    Create SM Pod
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Pods List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div
                  className="aspect-video rounded-lg mb-4"
                  style={{ backgroundColor: 'var(--muted)' }}
                />
                <div
                  className="h-6 rounded w-3/4 mb-2"
                  style={{ backgroundColor: 'var(--muted)' }}
                />
                <div
                  className="h-4 rounded w-1/2"
                  style={{ backgroundColor: 'var(--muted)' }}
                />
              </div>
            ))}
          </div>
        ) : pods.length === 0 ? (
          <div className="text-center py-16">
            <Youtube
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              No SM Pods Yet
            </h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
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
                className="card overflow-hidden group"
              >
                {/* Thumbnail / Video Preview */}
                <div className="relative aspect-video">
                  {pod.thumbnailUrl ? (
                    <Image
                      src={pod.thumbnailUrl}
                      alt={pod.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <Youtube
                        className="h-12 w-12"
                        style={{ color: 'var(--muted-foreground)' }}
                      />
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
                      onClick={() => handleDelete(pod.id)}
                      disabled={deletingId === pod.id}
                      className="p-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                    >
                      {deletingId === pod.id ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className="font-bold text-lg line-clamp-2 mb-2"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {pod.title}
                  </h3>
                  {pod.content && (
                    <p
                      className="text-sm line-clamp-2 mb-3"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {pod.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {formatDate(pod.publishedAt || pod.createdAt)}
                    </span>
                    {pod.tags.length > 0 && (
                      <div className="flex gap-1">
                        {pod.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full capitalize"
                            style={{
                              backgroundColor: 'var(--muted)',
                              color: 'var(--muted-foreground)',
                            }}
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
      </div>
    </div>
  );
}

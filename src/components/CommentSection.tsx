'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageCircle,
  Send,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  replies: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { isSignedIn, user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isSignedIn) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !isSignedIn) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      const data = await response.json();
      if (data.success) {
        // Add reply to the parent comment
        setComments(
          comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...comment.replies, data.comment],
              };
            }
            return comment;
          })
        );
        setReplyContent('');
        setReplyingTo(null);
        // Expand replies to show the new one
        setExpandedReplies((prev) => new Set(prev).add(parentId));
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-(--border) pt-8">
      <h3 className="text-xl font-bold text-(--foreground) mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {/* Comment Input */}
      {isSignedIn ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-(--muted) shrink-0">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || 'You'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-5 w-5 text-(--muted-foreground)" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent resize-none transition-all"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-(--primary) text-(--primary-foreground) rounded-full font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-(--muted) rounded-xl text-center">
          <p className="text-(--muted-foreground) mb-3">
            Sign in to join the discussion
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--primary) text-(--primary-foreground) rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-full bg-(--muted)"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-(--muted) rounded w-32"></div>
                <div className="h-4 bg-(--muted) rounded w-full"></div>
                <div className="h-4 bg-(--muted) rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-(--muted-foreground)">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              {/* Main Comment */}
              <div className="flex gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-(--muted) shrink-0">
                  {comment.author.imageUrl ? (
                    <Image
                      src={comment.author.imageUrl}
                      alt={comment.author.name || 'Author'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-5 w-5 text-(--muted-foreground)" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-(--foreground) text-sm">
                      {comment.author.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-(--muted-foreground)">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-(--foreground) text-sm leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Reply button */}
                  {isSignedIn && (
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                      className="mt-2 text-xs text-(--muted-foreground) hover:text-(--primary) transition-colors"
                    >
                      Reply
                    </button>
                  )}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 bg-(--background) border border-(--border) rounded-lg text-sm text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                      />
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || submitting}
                        className="px-3 py-2 bg-(--primary) text-(--primary-foreground) rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Replies toggle */}
                  {comment.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="mt-3 flex items-center gap-1 text-xs text-(--primary) hover:underline"
                    >
                      {expandedReplies.has(comment.id) ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Hide replies
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          View {comment.replies.length}{' '}
                          {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </button>
                  )}

                  {/* Replies list */}
                  {expandedReplies.has(comment.id) &&
                    comment.replies.length > 0 && (
                      <div className="mt-4 ml-4 pl-4 border-l-2 border-(--border) space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-(--muted) shrink-0">
                              {reply.author.imageUrl ? (
                                <Image
                                  src={reply.author.imageUrl}
                                  alt={reply.author.name || 'Author'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-(--muted-foreground)" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-(--foreground) text-xs">
                                  {reply.author.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-(--muted-foreground)">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-(--foreground) text-sm leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

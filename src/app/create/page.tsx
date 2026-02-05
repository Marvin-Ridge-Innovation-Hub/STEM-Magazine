'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitPost } from '@/actions/submission.actions';
import {
  saveDraft,
  getDraft,
  updateDraftAction,
  deleteDraftAction,
} from '@/actions/draft.actions';
import { PostType as PostTypeEnum } from '@/types';
import {
  X,
  Plus,
  GripVertical,
  ImageIcon,
  Target,
  Newspaper,
} from 'lucide-react';

type PostType = 'SM Expo' | 'SM Now' | null;

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [postType, setPostType] = useState<PostType>(null);
  const [postTypeConfirmed, setPostTypeConfirmed] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Available tags
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

  // form state
  const [title, setTitle] = useState('');
  // For SM Expo: multiple images (1-5)
  const [imageFileMap, setImageFileMap] = useState<Record<string, File>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // For SM Now: single thumbnail (legacy support)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [projectLinks, setProjectLinks] = useState<string[]>(['']);
  const [content, setContent] = useState('');
  const [sources, setSources] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // UI helpers
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Multi-image handling for SM Expo
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingSlots = MAX_IMAGES - imagePreviews.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (filesToAdd.length < newFiles.length) {
      setMessage(
        `You can only upload up to ${MAX_IMAGES} images. Some images were not added.`
      );
      setTimeout(() => setMessage(null), 3000);
    }

    const previewUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setImagePreviews((prev) => [...prev, ...previewUrls]);
    setImageFileMap((prev) => {
      const next = { ...prev };
      previewUrls.forEach((url, idx) => {
        next[url] = filesToAdd[idx];
      });
      return next;
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    if (imagePreviews.length <= MIN_IMAGES && postType === 'SM Expo') {
      setMessage(`At least ${MIN_IMAGES} image is required for SM Expo posts.`);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const previewToRemove = imagePreviews[index];

    // Revoke URL to prevent memory leaks
    if (previewToRemove?.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }

    setImageFileMap((prev) => {
      const next = { ...prev };
      delete next[previewToRemove];
      return next;
    });
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder images
    const newPreviews = [...imagePreviews];

    const [draggedPreview] = newPreviews.splice(draggedIndex, 1);

    newPreviews.splice(index, 0, draggedPreview);

    setImagePreviews(newPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Load draft data if draftId is provided
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId]);

  const loadDraft = async (id: string) => {
    setIsLoadingDraft(true);
    try {
      const result = await getDraft(id);
      if (result.success && result.draft) {
        const draft = result.draft;
        setCurrentDraftId(id);

        // Set post type
        if (draft.postType === 'SM_EXPO') {
          setPostType('SM Expo');
          setPostTypeConfirmed(true);
        } else if (draft.postType === 'SM_NOW') {
          setPostType('SM Now');
          setPostTypeConfirmed(true);
        }

        // Set form fields
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.projectLinks && draft.projectLinks.length > 0) {
          setProjectLinks(draft.projectLinks);
        }
        if (draft.sources) setSources(draft.sources);
        if (draft.tags && draft.tags.length > 0) {
          setSelectedTags(draft.tags);
        }

        // Clear any locally staged files when loading a draft
        setImageFileMap({});

        // Load images for SM Expo
        if (draft.images && draft.images.length > 0) {
          setImagePreviews(draft.images);
        } else if (draft.thumbnailFile) {
          // Legacy: single thumbnail
          setThumbnailPreview(draft.thumbnailFile);
        }
      } else {
        setMessage('Failed to load draft');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      setMessage('Failed to load draft');
    } finally {
      setIsLoadingDraft(false);
    }
  };

  // Upload image to Cloudinary via API
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.url;
      } else {
        console.error('Upload failed:', data.error);
        setMessage(data.error || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  // Project links management
  const updateProjectLink = (index: number, value: string) => {
    setProjectLinks((prev) => prev.map((p, i) => (i === index ? value : p)));
  };
  const addProjectLink = () => setProjectLinks((prev) => [...prev, '']);
  const removeProjectLink = (index: number) =>
    setProjectLinks((prev) => prev.filter((_, i) => i !== index));

  // Submit for review
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validation
    if (!postType || !title.trim() || !content.trim()) {
      setMessage('Please fill in all required fields.');
      return;
    }

    // For SM Expo, require at least one image
    if (postType === 'SM Expo' && imagePreviews.length === 0) {
      setMessage('SM Expo posts require at least 1 image.');
      return;
    }

    // For SM Now, require a thumbnail
    if (postType === 'SM Now' && !thumbnailFile && !thumbnailPreview) {
      setMessage('SM Now posts require a thumbnail image.');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      let uploadedImages: string[] = [];
      let thumbnailUrl: string | undefined = undefined;

      if (postType === 'SM Expo') {
        // Upload all images for SM Expo
        for (const preview of imagePreviews) {
          if (preview.startsWith('http')) {
            uploadedImages.push(preview);
            continue;
          }

          const file = imageFileMap[preview];
          if (!file) {
            continue;
          }

          const uploadedUrl = await uploadToCloudinary(file);
          if (!uploadedUrl) {
            setIsSubmitting(false);
            return; // Error message already set by uploadToCloudinary
          }
          uploadedImages.push(uploadedUrl);
        }

        // First image is the thumbnail
        thumbnailUrl = uploadedImages[0];
      } else {
        // SM Now: single thumbnail
        if (thumbnailFile) {
          // Upload new file
          const uploadedUrl = await uploadToCloudinary(thumbnailFile);
          if (!uploadedUrl) {
            setIsSubmitting(false);
            return;
          }
          thumbnailUrl = uploadedUrl;
        } else if (thumbnailPreview?.startsWith('http')) {
          // Use existing uploaded thumbnail URL (from saved draft)
          thumbnailUrl = thumbnailPreview;
        }
      }

      const result = await submitPost({
        postType:
          postType === 'SM Expo' ? PostTypeEnum.SM_EXPO : PostTypeEnum.SM_NOW,
        title,
        content,
        thumbnailUrl,
        images: postType === 'SM Expo' ? uploadedImages : undefined,
        projectLinks:
          postType === 'SM Expo'
            ? projectLinks.filter((p) => p.trim() !== '')
            : undefined,
        sources: postType === 'SM Now' ? sources : undefined,
        tags: selectedTags,
      });

      if (result.success) {
        // Delete the draft if we were editing one
        if (currentDraftId) {
          try {
            await deleteDraftAction(currentDraftId);
          } catch (err) {
            console.error('Failed to delete draft after submission:', err);
            // Don't block submission success for draft deletion failure
          }
        }
        // Redirect to success page
        router.push(`/submission-success?submissionId=${result.submissionId}`);
      } else {
        setMessage(result.error || 'Failed to submit post');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setMessage('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!postType) {
      setMessage('Please select a post destination.');
      return;
    }
    setPostTypeConfirmed(true);
    setMessage(null);
  };

  const handleReviewPost = () => {
    // Basic validation
    if (!title.trim() || !content.trim()) {
      setMessage('Title and Content are required.');
      return;
    }
    // For SM Expo, require at least one image
    if (postType === 'SM Expo' && imagePreviews.length === 0) {
      setMessage('SM Expo posts require at least 1 image.');
      return;
    }
    // For SM Now, require a thumbnail
    if (postType === 'SM Now' && !thumbnailFile && !thumbnailPreview) {
      setMessage('SM Now posts require a thumbnail image.');
      return;
    }
    setShowReview(true);
    setMessage(null);
    // Scroll to top to see the review
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToEdit = () => {
    setShowReview(false);
  };

  const handleStartOver = () => {
    if (window.confirm('Are you sure? This will delete all your progress.')) {
      setPostType(null);
      setPostTypeConfirmed(false);
      setShowReview(false);
      setTitle('');
      setThumbnailFile(null);
      setThumbnailPreview(null);
      // Clear multi-image state
      imagePreviews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      setImageFileMap({});
      setImagePreviews([]);
      setProjectLinks(['']);
      setContent('');
      setSources('');
      setSelectedTags([]);
      setMessage(null);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setMessage(null);

    try {
      let uploadedImages: string[] = [];
      let thumbnailFileInfo: string | undefined = thumbnailPreview || undefined;

      if (postType === 'SM Expo') {
        for (const preview of imagePreviews) {
          if (preview.startsWith('http')) {
            uploadedImages.push(preview);
            continue;
          }

          const file = imageFileMap[preview];
          if (!file) {
            continue;
          }

          const uploadedUrl = await uploadToCloudinary(file);
          if (uploadedUrl) {
            uploadedImages.push(uploadedUrl);
          }
          // Don't fail draft save if upload fails
        }

        thumbnailFileInfo = uploadedImages[0];
      } else if (thumbnailFile) {
        // SM Now: single thumbnail
        const uploadedUrl = await uploadToCloudinary(thumbnailFile);
        if (uploadedUrl) {
          thumbnailFileInfo = uploadedUrl;
        }
      }

      let result;

      if (currentDraftId) {
        // Update existing draft
        result = await updateDraftAction({
          id: currentDraftId,
          postType:
            postType === 'SM Expo'
              ? PostTypeEnum.SM_EXPO
              : postType === 'SM Now'
                ? PostTypeEnum.SM_NOW
                : undefined,
          title: title || undefined,
          content: content || undefined,
          thumbnailFile: thumbnailFileInfo,
          images: postType === 'SM Expo' ? uploadedImages : undefined,
          projectLinks: projectLinks.filter((p) => p.trim() !== ''),
          sources: sources || undefined,
          tags: selectedTags,
        });
      } else {
        // Create new draft
        result = await saveDraft({
          postType:
            postType === 'SM Expo'
              ? PostTypeEnum.SM_EXPO
              : postType === 'SM Now'
                ? PostTypeEnum.SM_NOW
                : undefined,
          title: title || undefined,
          content: content || undefined,
          thumbnailFile: thumbnailFileInfo,
          images: postType === 'SM Expo' ? uploadedImages : undefined,
          projectLinks: projectLinks.filter((p) => p.trim() !== ''),
          sources: sources || undefined,
          tags: selectedTags,
        });

        // Set the draft ID for future saves
        if (result.success && result.draftId) {
          setCurrentDraftId(result.draftId);
        }
      }

      if (result.success) {
        // Update local state to reflect uploaded images
        // This ensures that if the user submits after saving, the images are correctly captured
        if (postType === 'SM Expo' && uploadedImages.length > 0) {
          // Revoke old blob URLs to prevent memory leaks
          imagePreviews.forEach((url) => {
            if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          });
          // Update previews with the actual uploaded URLs
          setImagePreviews(uploadedImages);
          // Clear file objects since they've been uploaded
          setImageFileMap({});
        } else if (postType === 'SM Now' && thumbnailFileInfo) {
          // For SM Now: update thumbnail preview with the actual URL and clear the file
          if (thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailPreview);
          }
          setThumbnailPreview(thumbnailFileInfo);
          setThumbnailFile(null);
        }
        setMessage('Draft saved successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setMessage('An unexpected error occurred while saving draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Show loading state while loading draft
  if (isLoadingDraft) {
    return (
      <main className="min-h-screen bg-(--background) p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary) mb-4"></div>
          <p className="text-(--muted-foreground)">Loading draft...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--background) p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6 text-(--foreground)"
        >
          {currentDraftId ? 'Edit Draft' : 'Create a new post'}
        </motion.h1>

        {!postTypeConfirmed ? (
          /* Initial Post Type Selection */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-(--card) p-8 rounded-lg shadow-sm border border-(--border) space-y-6"
          >
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-(--foreground) mb-3">
                Where would you like to post?{' '}
                <span className="text-red-500">*</span>
                <button
                  type="button"
                  className="ml-2 text-xs px-2 py-1 border border-(--border) rounded hover:bg-(--accent) transition-colors duration-200"
                  aria-expanded={showTypeTooltip}
                  onClick={() => setShowTypeTooltip((v) => !v)}
                >
                  ?
                </button>
              </label>
              {showTypeTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border border-(--border) rounded bg-(--muted) text-sm shadow-sm mb-3 text-(--foreground)"
                >
                  <strong>SM Expo</strong>: For showcasing projects, demos, and
                  portfolio-style posts. Best for completed or in-progress
                  projects with links or media.
                  <div className="mt-2">
                    <strong>SM Now</strong>: For quick updates, thoughts,
                    announcements, or news-style posts. Shorter, fast
                    publishing; include sources if referencing research.
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <label
                  className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${postType === 'SM Expo' ? 'border-blue-500 bg-blue-500/10 shadow-lg ring-2 ring-blue-500/30' : 'border-(--border) bg-(--card) hover:border-blue-500/50'} hover:shadow-md`}
                >
                  <input
                    type="radio"
                    name="postType"
                    value="SM Expo"
                    className="sr-only"
                    checked={postType === 'SM Expo'}
                    onChange={() => setPostType('SM Expo')}
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-semibold text-(--foreground)">
                      SM Expo
                    </span>
                  </div>
                  <div className="text-sm text-(--muted-foreground)">
                    Showcase projects, demos, and portfolio-style posts.
                  </div>
                </label>

                <label
                  className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${postType === 'SM Now' ? 'border-purple-500 bg-purple-500/10 shadow-lg ring-2 ring-purple-500/30' : 'border-(--border) bg-(--card) hover:border-purple-500/50'} hover:shadow-md`}
                >
                  <input
                    type="radio"
                    name="postType"
                    value="SM Now"
                    className="sr-only"
                    checked={postType === 'SM Now'}
                    onChange={() => setPostType('SM Now')}
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Newspaper className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="font-semibold text-(--foreground)">
                      SM Now
                    </span>
                  </div>
                  <div className="text-sm text-(--muted-foreground)">
                    Quick updates, announcements, or news-style posts. Include
                    sources if needed.
                  </div>
                </label>
              </div>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-900"
              >
                {message}
              </motion.div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!postType}
                className="px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg hover:bg-(--primary)/90 transition-colors duration-200 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : showReview ? (
          /* Review Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header with Back Button */}
            <div className="bg-(--card) p-4 rounded-lg shadow-sm border border-(--border) flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-(--muted-foreground)">
                  Posting to:
                </span>
                <span className="px-3 py-1 rounded-full bg-(--primary)/20 text-(--primary) font-medium border border-(--primary)/30">
                  {postType}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToEdit}
                  className="text-sm text-(--muted-foreground) hover:text-(--foreground) underline transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="text-sm text-(--muted-foreground) hover:text-(--foreground) underline transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* Review Section */}
            <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-(--foreground)">
                  Review Your Post
                </h2>
                <span className="text-xs px-2 py-1 rounded bg-(--accent) text-(--accent-foreground)">
                  Preview
                </span>
              </div>

              <div className="text-sm text-(--muted-foreground) bg-(--muted)/50 p-3 rounded">
                ℹ️ This is how your post will appear when published. Review
                carefully before submitting.
              </div>

              {/* Post Preview */}
              <div className="border-2 border-(--primary)/20 rounded-lg overflow-hidden bg-(--background) shadow-md">
                {/* Images - SM Expo gets carousel, SM Now gets single thumbnail */}
                {postType === 'SM Expo' && imagePreviews.length > 0 && (
                  <div className="relative w-full">
                    {imagePreviews.length === 1 ? (
                      <div className="relative w-full h-64 bg-(--muted)">
                        <Image
                          src={imagePreviews[0]}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="text-xs text-(--muted-foreground) mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          {imagePreviews.length} images - Use arrows to navigate
                          when published
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {imagePreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              className={`relative aspect-square rounded overflow-hidden ${idx === 0 ? 'ring-2 ring-(--primary)' : ''}`}
                            >
                              <Image
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                              {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-(--primary) text-(--primary-foreground) text-xs text-center py-0.5">
                                  Cover
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {postType === 'SM Now' && thumbnailPreview && (
                  <div className="relative w-full h-64 bg-(--muted)">
                    <Image
                      src={thumbnailPreview}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-8 space-y-4">
                  {/* Title */}
                  <h1 className="text-3xl font-bold text-(--foreground)">
                    {title}
                  </h1>

                  {/* Project Links for SM Expo */}
                  {postType === 'SM Expo' &&
                    projectLinks.filter((p) => p.trim() !== '').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {projectLinks
                          .filter((p) => p.trim() !== '')
                          .map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-(--primary)/10 text-(--primary) hover:bg-(--primary)/20 transition-colors border border-(--primary)/20"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              {i === 0 ? 'Main Project' : `Link ${i + 1}`}
                            </a>
                          ))}
                      </div>
                    )}

                  {/* Content Body */}
                  <div className="prose prose-sm md:prose-base max-w-none text-(--foreground)">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {content}
                    </div>
                  </div>

                  {/* Sources for SM Now */}
                  {postType === 'SM Now' && sources.trim() && (
                    <div className="mt-8 pt-6 border-t border-(--border)">
                      <h3 className="text-lg font-semibold text-(--foreground) mb-3">
                        Sources
                      </h3>
                      <div className="text-sm text-(--muted-foreground) whitespace-pre-wrap bg-(--muted) p-4 rounded">
                        {sources}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-900"
              >
                {message}
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleBackToEdit}
                disabled={isSubmitting || isUploading}
                className="px-6 py-3 border border-(--border) rounded-lg hover:bg-(--accent) transition-colors duration-200 font-medium text-(--foreground) disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg hover:bg-(--primary)/90 transition-colors duration-200 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? 'Uploading image...'
                  : isSubmitting
                    ? 'Submitting...'
                    : 'Submit for Review'}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Form after Post Type is Confirmed */
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Post Type Badge with Start Over Button */}
            <div className="bg-(--card) p-4 rounded-lg shadow-sm border border-(--border) flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-(--muted-foreground)">
                  Posting to:
                </span>
                <span className="px-3 py-1 rounded-full bg-(--primary)/20 text-(--primary) font-medium border border-(--primary)/30">
                  {postType}
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm text-(--muted-foreground) hover:text-(--foreground) underline transition-colors"
              >
                Start Over
              </button>
            </div>

            {/* Title */}
            <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-2">
              <label className="block text-sm font-medium text-(--foreground)">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear, descriptive title"
                className="w-full border border-(--border) rounded px-3 py-2 bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />
            </div>

            {/* Images for SM Expo (1-5 images) */}
            {postType === 'SM Expo' && (
              <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-(--foreground)">
                    Project Images <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-(--muted-foreground)">
                    {imagePreviews.length} / {MAX_IMAGES} images
                  </span>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {/* Existing previews and new files combined */}
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={`preview-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move ${
                        index === 0
                          ? 'border-(--primary) ring-2 ring-(--primary)/30'
                          : 'border-(--border)'
                      } ${draggedIndex === index ? 'opacity-50' : ''}`}
                    >
                      <Image
                        src={preview}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {/* First image badge */}
                      {index === 0 && (
                        <div className="absolute top-1 left-1 px-2 py-0.5 bg-(--primary) text-(--primary-foreground) text-xs rounded font-medium">
                          Cover
                        </div>
                      )}
                      {/* Drag handle */}
                      <div className="absolute top-1 right-8 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}

                  {/* Add more images button */}
                  {imagePreviews.length < MAX_IMAGES && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-(--border) flex flex-col items-center justify-center cursor-pointer hover:border-(--primary) hover:bg-(--primary)/5 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddImages}
                        className="sr-only"
                      />
                      <Plus className="w-8 h-8 text-(--muted-foreground)" />
                      <span className="text-xs text-(--muted-foreground) mt-1">
                        Add Image
                      </span>
                    </label>
                  )}
                </div>

                <div className="text-xs text-(--muted-foreground) space-y-1">
                  <p>
                    • Upload 1-5 images. The first image will be used as the
                    cover/thumbnail.
                  </p>
                  <p>• Drag images to reorder them. Click the X to remove.</p>
                  <p>
                    • Recommended: JPG/PNG, 1200x800 or similar aspect ratio.
                  </p>
                </div>
              </div>
            )}

            {/* Thumbnail for SM Now (single image, required) */}
            {postType === 'SM Now' && (
              <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-2">
                <label className="block text-sm font-medium text-(--foreground)">
                  Thumbnail <span className="text-red-500">*</span>
                </label>

                {/* Show uploaded image indicator if we have an http URL */}
                {thumbnailPreview?.startsWith('http') && !thumbnailFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-(--accent)/50 rounded-lg border border-(--border)">
                      <div className="flex-1 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-(--foreground)">
                          Image uploaded
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null);
                          setThumbnailFile(null);
                        }}
                        className="text-sm px-3 py-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-sm text-(--muted-foreground)">
                        Preview
                      </div>
                      <Image
                        src={thumbnailPreview}
                        alt="thumbnail preview"
                        className="mt-1 max-h-40 rounded border border-(--border)"
                        width={300}
                        height={160}
                        style={{
                          maxHeight: '10rem',
                          width: 'auto',
                          height: 'auto',
                        }}
                      />
                    </motion.div>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailPreview(null);
                        // Trigger file input click
                        const input = document.getElementById(
                          'thumbnail-input'
                        ) as HTMLInputElement;
                        if (input) input.click();
                      }}
                      className="text-sm text-(--primary) hover:underline"
                    >
                      Choose a different image
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id="thumbnail-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setThumbnailFile(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      className="block text-(--foreground) file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-(--primary) file:text-(--primary-foreground) hover:file:bg-(--primary)/90 file:cursor-pointer"
                    />
                    {thumbnailPreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2"
                      >
                        <div className="text-sm text-(--muted-foreground)">
                          Preview
                        </div>
                        <Image
                          src={thumbnailPreview}
                          alt="thumbnail preview"
                          className="mt-1 max-h-40 rounded border border-(--border)"
                          width={300}
                          height={160}
                          style={{
                            maxHeight: '10rem',
                            width: 'auto',
                            height: 'auto',
                          }}
                        />
                      </motion.div>
                    )}
                  </>
                )}

                <div className="text-xs text-(--muted-foreground)">
                  A thumbnail helps attract attention. Recommended: JPG/PNG,
                  1200x628 or similar aspect.
                </div>
              </div>
            )}

            {/* Project Links for SM Expo */}
            {postType === 'SM Expo' && (
              <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-2">
                <label className="block text-sm font-medium text-(--foreground)">
                  Project Links
                </label>
                <div className="space-y-2">
                  {projectLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateProjectLink(i, e.target.value)}
                        placeholder={
                          i === 0
                            ? 'https://your-project.com (primary)'
                            : 'Additional link (e.g. repo, demo)'
                        }
                        className="flex-1 border border-(--border) rounded px-3 py-2 bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                      />
                      <button
                        type="button"
                        onClick={() => removeProjectLink(i)}
                        disabled={projectLinks.length === 1}
                        className="px-3 py-2 border border-(--border) rounded disabled:opacity-40 bg-(--card) text-(--foreground) hover:bg-(--accent) transition-colors duration-200"
                        aria-label={`Remove link ${i + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addProjectLink}
                    className="text-sm text-(--primary) hover:underline"
                  >
                    + Add another link
                  </button>
                </div>
                <div className="text-xs text-(--muted-foreground)">
                  Include links to demos, repos, or live sites to boost
                  engagement.
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-2">
              <label className="block text-sm font-medium text-(--foreground)">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here. You can include sections, headings, or markdown (rendering not provided here)."
                className="w-full border border-(--border) rounded px-3 py-2 min-h-50 resize-vertical bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />
              <div className="text-xs text-(--muted-foreground)">
                Provide helpful context: what, why, how, and any notes readers
                should know.
              </div>
            </div>

            {/* Tags Selection */}
            <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-3">
              <label className="block text-sm font-medium text-(--foreground)">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full font-medium capitalize transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-(--accent) text-(--accent-foreground) shadow-md'
                        : 'bg-(--muted) text-(--foreground) hover:bg-(--muted)/80 border border-(--border)'
                    }`}
                  >
                    {tag.replace('-', ' ')}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="text-xs text-(--muted-foreground)">
                  Selected:{' '}
                  {selectedTags.map((t) => t.replace('-', ' ')).join(', ')}
                </div>
              )}
              <div className="text-xs text-(--muted-foreground)">
                Select relevant tags to help readers find your post.
              </div>
            </div>

            {/* Sources for SM Now */}
            {postType === 'SM Now' && (
              <div className="bg-(--card) p-6 rounded-lg shadow-sm border border-(--border) space-y-2">
                <label className="block text-sm font-medium text-(--foreground)">
                  Sources (MLA)
                </label>
                <textarea
                  value={sources}
                  onChange={(e) => setSources(e.target.value)}
                  placeholder="Provide MLA formatted sources or references used for this post."
                  className="w-full border border-(--border) rounded px-3 py-2 min-h-30 resize-vertical bg-(--background) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
                <div className="text-xs text-(--muted-foreground)">
                  Optional but recommended when referencing external research.
                  Example: Author. "Title." Journal, Year.
                </div>
              </div>
            )}

            {/* Error message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-sm p-3 rounded border ${
                  message.includes('saved successfully')
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900'
                    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                }`}
              >
                {message}
              </motion.div>
            )}

            {/* Review button */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="px-6 py-3 border border-(--border) rounded-lg hover:bg-(--accent) transition-colors duration-200 font-medium text-(--foreground) flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                {isSavingDraft ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={handleReviewPost}
                className="px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg hover:bg-(--primary)/90 transition-colors duration-200 shadow-sm font-medium"
              >
                Review Post →
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </main>
  );
}

import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { ReactNode } from 'react';

export type NextPageWithLayout = NextPage & {
  getLayout?: () => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type ChildrenProps = {
  children: ReactNode;
};

export type IToken = {
  accessToken: string;
  refreshToken?: string;
};

export interface CurrentUserProps {
  currentUser?: {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    password: string | null;
    isAdmin: boolean;
  } | null;
}

// Submission System Types

export enum PostType {
  SM_EXPO = 'SM_EXPO',
  SM_NOW = 'SM_NOW',
  SM_PODS = 'SM_PODS',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Submission {
  id: string;
  postType: PostType;
  title: string;
  content: string;
  thumbnailUrl?: string;
  images: string[]; // For SM Expo: array of image URLs (1-5)
  youtubeUrl?: string; // For SM Pods: YouTube video URL
  projectLinks: string[];
  sources?: string;
  tags: string[];
  status: SubmissionStatus;
  authorId: string;
  reviewedBy?: string;
  rejectionReason?: string;
  approvalToken?: string;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date;
  reviewedAt?: Date;
  publishedAt?: Date;
}

export interface Draft {
  id: string;
  postType?: PostType;
  title?: string;
  content?: string;
  thumbnailFile?: string;
  images: string[]; // For SM Expo: array of image URLs (1-5)
  projectLinks: string[];
  sources?: string;
  tags: string[];
  draftName: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  role: string;
  submissions: Submission[];
  drafts: Draft[];
  postIds: string[];
  draftIds: string[];
  pendingPostIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubmissionInput {
  postType: PostType;
  title: string;
  content: string;
  thumbnailUrl?: string;
  images?: string[]; // For SM Expo: array of image URLs (1-5)
  projectLinks?: string[];
  sources?: string;
  tags?: string[];
}

export interface CreateDraftInput {
  postType?: PostType;
  title?: string;
  content?: string;
  thumbnailFile?: string;
  images?: string[]; // For SM Expo: array of image URLs (1-5)
  projectLinks?: string[];
  sources?: string;
  tags?: string[];
}

export interface UpdateDraftInput extends Partial<CreateDraftInput> {
  id: string;
}

export interface DashboardData {
  user: UserProfile;
  drafts: Draft[];
  pendingSubmissions: Submission[];
  approvedSubmissions: Submission[];
  rejectedSubmissions: Submission[];
  stats: {
    totalDrafts: number;
    totalSubmissions: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

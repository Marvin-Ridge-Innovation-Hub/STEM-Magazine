import { useFetch } from '@/hooks/useAPiCall';
import { postService } from '@/services/postService';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  author: {
    name?: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  viewCount?: number;
  commentCount?: number;
}

export const usePosts = (
  query: string = '',
  category?: string,
  sortBy: string = 'newest'
) => {
  return useFetch(['posts', query, category, sortBy], () =>
    postService.getPosts(query, category, sortBy)
  );
};
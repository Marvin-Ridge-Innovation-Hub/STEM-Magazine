export const postService = {
  getPosts: async (query: string = '', category?: string, sortBy: string = 'newest') => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (sortBy) params.append('sortBy', sortBy);

    const url = params.toString() ? `/api/posts?${params.toString()}` : '/api/posts';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  },

  createPost: async (data: {
    title: string;
    content: string;
    authorId: string;
  }) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  },
};
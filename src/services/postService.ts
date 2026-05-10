export const postService = {
  getPosts: async (
    search: string = '',
    type?: string,
    _sortBy: string = 'newest'
  ) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'ALL') params.append('type', type);

    const url = params.toString()
      ? `/api/posts?${params.toString()}`
      : '/api/posts';
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

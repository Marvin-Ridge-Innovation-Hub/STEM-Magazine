import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  // Clear existing posts to avoid duplicates
  await prisma.post.deleteMany();
  console.log('Cleared posts table');

  // Take first user from db
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error('No user found');
  }

  // Create 15 sample posts with all schema fields
  await prisma.post.createMany({
    data: [
      {
        title: "Getting Started with Next.js",
        excerpt: "Learn the basics of Next.js 15 and its powerful features.",
        content: "Learn the basics of Next.js 15 and its powerful features for building modern web apps. This guide covers setup, routing, and data fetching.",
        coverImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479",
        category: "Technology",
        tags: ["Next.js", "React", "Web Development"],
        readTime: 5,
        viewCount: 120,
        commentCount: 8,
        featured: true,
        published: true,
        authorId: user.id,
        slug: "getting-started-with-next-js",
        createdAt: new Date("2025-05-01T10:00:00Z"),
        updatedAt: new Date("2025-05-01T10:00:00Z")
      },
      {
        title: "Why TypeScript is a Game Changer",
        excerpt: "Explore how TypeScript enhances JavaScript development.",
        content: "Explore how TypeScript enhances JavaScript development with static typing and better tooling. Learn about interfaces, generics, and more.",
        coverImage: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
        category: "Technology",
        tags: ["TypeScript", "JavaScript", "Development"],
        readTime: 4,
        viewCount: 95,
        commentCount: 5,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "why-typescript-is-a-game-changer",
        createdAt: new Date("2025-05-02T12:30:00Z"),
        updatedAt: new Date("2025-05-02T12:30:00Z")
      },
      {
        title: "Building a Blog with Prisma and MongoDB",
        excerpt: "A step-by-step guide to creating a blog with Prisma.",
        content: "A step-by-step guide to creating a blog using Prisma and MongoDB for data storage. Covers schema design, queries, and API routes.",
        coverImage: "https://images.unsplash.com/photo-1555066931-43674753d504",
        category: "Technology",
        tags: ["Prisma", "MongoDB", "Blog"],
        readTime: 6,
        viewCount: 150,
        commentCount: 12,
        featured: true,
        published: true,
        authorId: user.id,
        slug: "building-a-blog-with-prisma-and-mongodb",
        createdAt: new Date("2025-05-03T09:15:00Z"),
        updatedAt: new Date("2025-05-03T09:15:00Z")
      },
      {
        title: "React Query: Simplifying Data Fetching",
        excerpt: "Discover how React Query simplifies data fetching.",
        content: "Discover how React Query makes data fetching and state management easier in React apps. Includes examples and best practices.",
        coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        category: "Technology",
        tags: ["React Query", "React", "Data Fetching"],
        readTime: 3,
        viewCount: 80,
        commentCount: 3,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "react-query-simplifying-data-fetching",
        createdAt: new Date("2025-05-04T14:20:00Z"),
        updatedAt: new Date("2025-05-04T14:20:00Z")
      },
      {
        title: "Tailwind CSS Tips and Tricks",
        excerpt: "Master Tailwind CSS with advanced tips.",
        content: "Master Tailwind CSS with these advanced tips for creating responsive and beautiful UIs. Learn utility-first CSS techniques.",
        coverImage: "https://images.unsplash.com/photo-1507238691744-903d9b38b31b",
        category: "Design",
        tags: ["Tailwind CSS", "CSS", "UI Design"],
        readTime: 4,
        viewCount: 200,
        commentCount: 15,
        featured: true,
        published: true,
        authorId: user.id,
        slug: "tailwind-css-tips-and-tricks",
        createdAt: new Date("2025-05-04T16:45:00Z"),
        updatedAt: new Date("2025-05-04T16:45:00Z")
      },
      {
        title: "Authentication with Clerk in Next.js",
        excerpt: "Integrate Clerk for secure authentication.",
        content: "Learn how to integrate Clerk for secure and scalable authentication in your Next.js app. Covers setup and user management.",
        coverImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
        category: "Technology",
        tags: ["Clerk", "Next.js", "Authentication"],
        readTime: 5,
        viewCount: 110,
        commentCount: 7,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "authentication-with-clerk-in-next-js",
        createdAt: new Date("2025-05-05T08:00:00Z"),
        updatedAt: new Date("2025-05-05T08:00:00Z")
      },
      {
        title: "Optimizing Next.js Performance",
        excerpt: "Techniques to improve Next.js performance.",
        content: "Techniques to improve the performance of your Next.js applications, including lazy loading and caching strategies.",
        coverImage: "https://images.unsplash.com/photo-1593642532973-d31b97d0eb4c",
        category: "Technology",
        tags: ["Next.js", "Performance", "Optimization"],
        readTime: 6,
        viewCount: 130,
        commentCount: 9,
        featured: true,
        published: true,
        authorId: user.id,
        slug: "optimizing-next-js-performance",
        createdAt: new Date("2025-05-05T11:10:00Z"),
        updatedAt: new Date("2025-05-05T11:10:00Z")
      },
      {
        title: "MongoDB Best Practices",
        excerpt: "Best practices for MongoDB schema design.",
        content: "Best practices for designing schemas and querying data efficiently in MongoDB. Includes indexing and aggregation tips.",
        coverImage: "https://images.unsplash.com/photo-1581472723648-909f4851d4ae",
        category: "Technology",
        tags: ["MongoDB", "Database", "Best Practices"],
        readTime: 5,
        viewCount: 90,
        commentCount: 4,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "mongodb-best-practices",
        createdAt: new Date("2025-05-05T13:25:00Z"),
        updatedAt: new Date("2025-05-05T13:25:00Z")
      },
      {
        title: "Creating Reusable React Components",
        excerpt: "Design reusable React components.",
        content: "How to design and build reusable React components for scalable applications. Covers component composition and props.",
        coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d",
        category: "Technology",
        tags: ["React", "Components", "Scalability"],
        readTime: 4,
        viewCount: 100,
        commentCount: 6,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "creating-reusable-react-components",
        createdAt: new Date("2025-05-05T15:50:00Z"),
        updatedAt: new Date("2025-05-05T15:50:00Z")
      },
      {
        title: "Introduction to Framer Motion",
        excerpt: "Add animations with Framer Motion.",
        content: "Add stunning animations to your web apps with Framer Motion, a powerful animation library for React.",
        coverImage: "https://images.unsplash.com/photo-1559028006-448665bd7c7f",
        category: "Design",
        tags: ["Framer Motion", "Animations", "React"],
        readTime: 3,
        viewCount: 85,
        commentCount: 3,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "introduction-to-framer-motion",
        createdAt: new Date("2025-05-06T10:30:00Z"),
        updatedAt: new Date("2025-05-06T10:30:00Z")
      },
      {
        title: "Deploying Next.js to Vercel",
        excerpt: "Deploy Next.js apps to Vercel.",
        content: "A guide to deploying your Next.js application to Vercel with zero configuration. Includes CI/CD setup.",
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        category: "Technology",
        tags: ["Next.js", "Vercel", "Deployment"],
        readTime: 4,
        viewCount: 140,
        commentCount: 10,
        featured: true,
        published: true,
        authorId: user.id,
        slug: "deploying-next-js-to-vercel",
        createdAt: new Date("2025-05-06T12:00:00Z"),
        updatedAt: new Date("2025-05-06T12:00:00Z")
      },
      {
        title: "State Management in React",
        excerpt: "Compare React state management solutions.",
        content: "Compare different state management solutions like Redux, Zustand, and React Query for React apps.",
        coverImage: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
        category: "Technology",
        tags: ["React", "State Management", "Redux"],
        readTime: 5,
        viewCount: 115,
        commentCount: 7,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "state-management-in-react",
        createdAt: new Date("2025-05-06T14:15:00Z"),
        updatedAt: new Date("2025-05-06T14:15:00Z")
      },
      {
        title: "Building a REST API with Next.js",
        excerpt: "Create a REST API with Next.js.",
        content: "Learn how to create a REST API using Next.js API routes and Prisma for data management.",
        coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        category: "Technology",
        tags: ["Next.js", "API", "Prisma"],
        readTime: 6,
        viewCount: 125,
        commentCount: 8,
        featured: true,
        published: true,
        authorId: user.id,
        slug: "building-a-rest-api-with-next-js",
        createdAt: new Date("2025-05-06T16:40:00Z"),
        updatedAt: new Date("2025-05-06T16:40:00Z")
      },
      {
        title: "CSS-in-JS vs Utility-First CSS",
        excerpt: "Compare CSS-in-JS and utility-first CSS.",
        content: "A comparison of CSS-in-JS libraries and utility-first frameworks like Tailwind CSS for styling.",
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        category: "Design",
        tags: ["CSS", "Tailwind CSS", "CSS-in-JS"],
        readTime: 4,
        viewCount: 105,
        commentCount: 5,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "css-in-js-vs-utility-first-css",
        createdAt: new Date("2025-05-07T09:20:00Z"),
        updatedAt: new Date("2025-05-07T09:20:00Z")
      },
      {
        title: "Testing Next.js Applications",
        excerpt: "Best practices for testing Next.js apps.",
        content: "Best tools and practices for unit and integration testing in Next.js apps, including Jest and Cypress.",
        coverImage: "https://images.unsplash.com/photo-1593642532973-d31b97d0eb4c",
        category: "Technology",
        tags: ["Next.js", "Testing", "Jest"],
        readTime: 5,
        viewCount: 95,
        commentCount: 4,
        featured: false,
        published: true,
        authorId: user.id,
        slug: "testing-next-js-applications",
        createdAt: new Date("2025-05-07T11:55:00Z"),
        updatedAt: new Date("2025-05-07T11:55:00Z")
      }
    ],
  });

  console.log('Seeded 15 posts with all schema fields');
}

main()
  .catch(e => console.error('Error seeding database:', e))
  .finally(async () => await prisma.$disconnect());
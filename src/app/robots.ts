import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: 'https://mrhsstemmag.com/sitemap.xml',
  };
}

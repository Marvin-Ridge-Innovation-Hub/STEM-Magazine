import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifySubscribers } from '@/services/newsletterService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// YouTube Data API v3 endpoint
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    resourceId?: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

interface YouTubeChannelResponse {
  items: Array<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
}

/**
 * Fetches videos from a YouTube channel and syncs them to SM Pods
 * GET - Fetch and sync videos from the configured YouTube channel
 */
export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube API key or Channel ID not configured',
          hint: 'Add YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID to your .env file',
        },
        { status: 500 }
      );
    }

    // Step 1: Get the uploads playlist ID for the channel
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      const error = await channelResponse.json();
      console.error('YouTube channel fetch error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch YouTube channel',
          details: error.error?.message,
        },
        { status: 500 }
      );
    }

    const channelData: YouTubeChannelResponse = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'YouTube channel not found',
        },
        { status: 404 }
      );
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 2: Fetch videos from the uploads playlist
    const videos: YouTubeVideo[] = [];
    let nextPageToken: string | undefined;
    const maxVideos = 50; // Limit to prevent too many API calls

    do {
      const playlistUrl = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
      playlistUrl.searchParams.set('part', 'snippet');
      playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
      playlistUrl.searchParams.set('maxResults', '50');
      playlistUrl.searchParams.set('key', apiKey);
      if (nextPageToken) {
        playlistUrl.searchParams.set('pageToken', nextPageToken);
      }

      const playlistResponse = await fetch(playlistUrl.toString());

      if (!playlistResponse.ok) {
        const error = await playlistResponse.json();
        console.error('YouTube playlist fetch error:', error);
        break;
      }

      const playlistData: YouTubePlaylistResponse =
        await playlistResponse.json();
      videos.push(...playlistData.items);
      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken && videos.length < maxVideos);

    // Step 3: Get existing SM Pods YouTube URLs to avoid duplicates
    const existingPods = await prisma.submission.findMany({
      where: {
        postType: 'SM_PODS',
      },
      select: {
        youtubeUrl: true,
      },
    });

    const existingUrls = new Set(
      existingPods
        .map((pod) => pod.youtubeUrl)
        .filter(Boolean)
        .map((url) => extractVideoId(url!))
    );

    // Step 4: Find admin user to set as author (or create system user)
    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [{ role: 'ADMIN' }, { role: 'MODERATOR' }],
      },
    });

    if (!adminUser) {
      // If no admin exists, we can't create pods
      return NextResponse.json(
        {
          success: false,
          error: 'No admin user found to assign as author',
          hint: 'Create an admin user first',
        },
        { status: 400 }
      );
    }

    // Step 5: Create new SM Pods for videos that don't exist
    const newPods: any[] = [];

    for (const video of videos) {
      const videoId = video.snippet.resourceId?.videoId || video.id;

      if (existingUrls.has(videoId)) {
        continue; // Skip existing videos
      }

      const thumbnailUrl =
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url;

      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

      try {
        const pod = await prisma.submission.create({
          data: {
            postType: 'SM_PODS',
            title: video.snippet.title,
            content: video.snippet.description || '',
            youtubeUrl,
            thumbnailUrl,
            tags: ['podcast'], // Default tag
            projectLinks: [],
            status: 'APPROVED',
            authorId: adminUser.id,
            reviewedBy: adminUser.clerkId,
            submittedAt: new Date(video.snippet.publishedAt),
            reviewedAt: new Date(),
            publishedAt: new Date(video.snippet.publishedAt),
          },
        });

        newPods.push({
          id: pod.id,
          title: pod.title,
          youtubeUrl: pod.youtubeUrl,
        });

        // Notify newsletter subscribers about the new pod (excludes the admin who synced it)
        await notifySubscribers({
          postType: 'SM_PODS',
          title: pod.title,
          excerpt:
            pod.content.substring(0, 200) || 'New podcast episode available!',
          postId: pod.id,
          authorName: 'STEM Magazine',
          authorId: adminUser.id, // Exclude the admin from newsletter notification
          tags: pod.tags,
          thumbnailUrl: pod.thumbnailUrl || undefined,
        });
      } catch (error) {
        console.error(`Failed to create pod for video ${videoId}:`, error);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: `Synced ${newPods.length} new videos from YouTube`,
      totalVideosFound: videos.length,
      newPodsCreated: newPods.length,
      newPods,
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('YouTube sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync YouTube videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return url; // Return as-is if no pattern matches (might be just the ID)
}

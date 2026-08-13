import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { SocialPostDto } from './types'

type SocialPostInsert = {
  id: string
  author_id: string
  content: string | null
  images: string[] | null
  content_type: string | null
  created_at: string
  like_count: number
  comment_count: number
  repost_count: number
}

export function subscribeToSocialPosts(onPost: (post: SocialPostDto) => void): RealtimeChannel {
  const supabase = createClient()
  return supabase
    .channel('social-posts')
    .on<SocialPostInsert>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'social_posts' },
      ({ new: post }) => onPost({
        id: post.id,
        authorId: post.author_id,
        content: post.content ?? undefined,
        images: post.images ?? [],
        contentType: post.content_type ?? undefined,
        createdAt: post.created_at,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        repostCount: post.repost_count,
        likedByMe: false,
      })
    )
    .subscribe()
}


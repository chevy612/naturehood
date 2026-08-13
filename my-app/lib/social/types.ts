export type SocialPostDto = {
  id: string
  authorId: string
  content?: string
  images: string[]
  contentType?: string
  createdAt: string
  likeCount: number
  commentCount: number
  repostCount: number
  likedByMe: boolean
}

export type SocialCommentDto = {
  id: string
  postId: string
  parentCommentId: string | null
  authorId: string
  content: string
  images: string[]
  contentType?: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  replyCount: number
  replies: SocialCommentDto[] | null
}

export type SocialPostRow = {
  id: string
  author_id: string
  content: string | null
  images: string[] | null
  content_type: string | null
  created_at: string
  like_count: number
  comment_count: number
  repost_count: number
  liked_by_me?: boolean
  rank_score?: number
  search_rank?: number
}

export type SocialCommentRow = {
  id: string
  post_id: string
  parent_comment_id: string | null
  author_id: string
  content: string
  images: string[] | null
  content_type: string | null
  created_at: string
  like_count: number
}

export function toSocialPostDto(row: SocialPostRow): SocialPostDto {
  return {
    id: row.id,
    authorId: row.author_id,
    content: row.content ?? undefined,
    images: row.images ?? [],
    contentType: row.content_type ?? undefined,
    createdAt: row.created_at,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    repostCount: row.repost_count,
    likedByMe: row.liked_by_me ?? false,
  }
}

export function toSocialCommentDto(row: SocialCommentRow): SocialCommentDto {
  return {
    id: row.id,
    postId: row.post_id,
    parentCommentId: row.parent_comment_id,
    authorId: row.author_id,
    content: row.content,
    images: row.images ?? [],
    contentType: row.content_type ?? undefined,
    createdAt: row.created_at,
    likeCount: row.like_count,
    likedByMe: false,
    replyCount: 0,
    replies: null,
  }
}


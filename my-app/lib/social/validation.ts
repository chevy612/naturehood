export type CreatePostPayload = {
  content?: string
  images?: string[]
  contentType?: string
}

export type CreateCommentPayload = {
  parentCommentId?: string | null
  content: string
  images?: string[]
  videos?: string[]
  contentType?: string
}

export const COMMENT_MEDIA_LIMIT = 3
export const COMMENT_CONTENT_LIMIT = 5000

function parseImages(value: unknown, max: number, label: string) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} images must be an array of strings`)
  }
  if (value.length > max) throw new Error(`A ${label.toLowerCase()} can have at most ${max} images`)
  return value
}

function optionalString(value: unknown, name: string) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') throw new Error(`${name} must be a string`)
  return value
}

export function parseCreatePost(body: unknown): CreatePostPayload {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Request body must be an object')
  const source = body as Record<string, unknown>
  const content = optionalString(source.content, 'Post content')
  if (content && content.length > 5000) throw new Error('Post content must not exceed 5000 characters')
  const images = parseImages(source.images, 4, 'Post')
  if (!content?.trim() && !images.length) throw new Error('Post must have content or at least one image')
  return { content, images, contentType: optionalString(source.contentType, 'Post contentType') }
}

function parseUrlList(value: unknown, max: number, label: string, noun: string) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} ${noun} must be an array of strings`)
  }
  if (value.length > max) throw new Error(`A ${label.toLowerCase()} can have at most ${max} ${noun}`)
  return value
}

export function parseCreateComment(body: unknown): CreateCommentPayload {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Request body must be an object')
  const source = body as Record<string, unknown>
  if (typeof source.content !== 'string') throw new Error('Comment content must be a string')
  if (source.content.length > COMMENT_CONTENT_LIMIT) {
    throw new Error(`Comment content must not exceed ${COMMENT_CONTENT_LIMIT} characters`)
  }
  const images = parseUrlList(source.images, COMMENT_MEDIA_LIMIT, 'Comment', 'images')
  const videos = parseUrlList(source.videos, COMMENT_MEDIA_LIMIT, 'Comment', 'videos')
  if (images.length > 0 && videos.length > 0) {
    throw new Error('A comment can include images or videos, not both')
  }
  if (!source.content.trim() && images.length === 0 && videos.length === 0) {
    throw new Error('Comment content must not be blank')
  }
  const parentCommentId = source.parentCommentId === undefined || source.parentCommentId === null
    ? null
    : optionalString(source.parentCommentId, 'Comment parentCommentId')
  return {
    parentCommentId,
    content: source.content,
    images,
    videos,
    contentType: optionalString(source.contentType, 'Comment contentType'),
  }
}


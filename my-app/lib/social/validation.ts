export type CreatePostPayload = {
  content?: string
  images?: string[]
  contentType?: string
}

export type CreateCommentPayload = {
  parentCommentId?: string | null
  content: string
  images?: string[]
  contentType?: string
}

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

export function parseCreateComment(body: unknown): CreateCommentPayload {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Request body must be an object')
  const source = body as Record<string, unknown>
  if (typeof source.content !== 'string' || !source.content.trim()) throw new Error('Comment content must not be blank')
  if (source.content.length > 300) throw new Error('Comment content must not exceed 300 characters')
  const parentCommentId = source.parentCommentId === undefined || source.parentCommentId === null
    ? null
    : optionalString(source.parentCommentId, 'Comment parentCommentId')
  return {
    parentCommentId,
    content: source.content,
    images: parseImages(source.images, 2, 'Comment'),
    contentType: optionalString(source.contentType, 'Comment contentType'),
  }
}


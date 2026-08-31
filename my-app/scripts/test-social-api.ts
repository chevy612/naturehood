import fs from 'node:fs'
import path from 'node:path'

type ApiEnvelope<T> = {
  success: boolean
  data: T | null
  error: string | null
}

type Post = {
  id: string
  authorId: string
  content?: string
}

type Comment = {
  id: string
  postId: string
  parentCommentId?: string
  content: string
}

type FeedPage<T> = {
  data: T[]
  nextCursor: string | null
  hasNext: boolean
}

function loadEnvFile(filename: string) {
  const filenamePath = path.join(process.cwd(), filename)
  if (!fs.existsSync(filenamePath)) return

  for (const line of fs.readFileSync(filenamePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env.dev')

const baseUrl = (process.env.SOCIAL_API_BASE_URL ?? 'https://naturehoodofficial.com').replace(/\/$/, '')
const accessToken = process.env.SOCIAL_TEST_ACCESS_TOKEN

if (!accessToken) {
  console.error('SOCIAL_TEST_ACCESS_TOKEN is required. Use a short-lived access token for a dedicated test user.')
  process.exit(1)
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function request<T>(
  method: string,
  route: string,
  options: { body?: unknown; authenticated?: boolean } = {}
) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.authenticated !== false) headers.Authorization = `Bearer ${accessToken}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const text = await response.text()
  let body: ApiEnvelope<T> | null = null
  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T>
    } catch {
      throw new Error(`${method} ${route} returned non-JSON content: ${text.slice(0, 200)}`)
    }
  }
  return { response, body }
}

function requireSuccess<T>(
  result: { response: Response; body: ApiEnvelope<T> | null },
  expectedStatus: number,
  label: string
): T {
  assert(result.response.status === expectedStatus, `${label}: expected ${expectedStatus}, got ${result.response.status} (${result.body?.error ?? 'no error body'})`)
  assert(result.body?.success === true && result.body.data !== null, `${label}: expected a successful response`)
  return result.body.data
}

function assertPageContains<T extends { id: string }>(page: FeedPage<T>, id: string, label: string) {
  assert(page.data.some((item) => item.id === id), `${label}: expected resource ${id} in the response page`)
}

async function main() {
  const runId = `social-api-smoke-${Date.now()}`
  let postId: string | null = null

  try {
    const options = await fetch(`${baseUrl}/api/posts`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example.test',
        'Access-Control-Request-Method': 'POST',
      },
    })
    assert(options.status === 204, `CORS preflight: expected 204, got ${options.status}`)
    assert(options.headers.get('access-control-allow-methods')?.includes('POST'), 'CORS preflight: POST is not allowed')
    assert(options.headers.get('access-control-allow-headers')?.includes('Authorization'), 'CORS preflight: Authorization is not allowed')
    console.log('PASS CORS preflight')

    const unauthenticated = await request<FeedPage<Post>>('GET', '/api/feed?limit=1', { authenticated: false })
    assert(unauthenticated.response.status === 401, `unauthenticated feed: expected 401, got ${unauthenticated.response.status}`)
    console.log('PASS unauthenticated requests are rejected')

    const invalidPost = await request<Post>('POST', '/api/posts', { body: {} })
    assert(invalidPost.response.status === 400, `invalid post validation: expected 400, got ${invalidPost.response.status}`)
    console.log('PASS post validation')

    const post = requireSuccess(
      await request<Post>('POST', '/api/posts', { body: { content: runId, contentType: 'text/plain' } }),
      201,
      'create post'
    )
    postId = post.id
    assert(post.content === runId, 'create post: returned content does not match')
    console.log(`PASS create post (${post.id})`)

    requireSuccess(await request<Post>('GET', `/api/posts/${post.id}`), 200, 'get post')
    console.log('PASS get post')

    const feed = requireSuccess(
      await request<FeedPage<Post>>('GET', '/api/feed?limit=50'),
      200,
      'list feed'
    )
    assertPageContains(feed, post.id, 'list feed')
    console.log('PASS list feed')

    const search = requireSuccess(
      await request<FeedPage<Post>>('GET', `/api/posts/search?q=${encodeURIComponent(runId)}`),
      200,
      'search posts'
    )
    assertPageContains(search, post.id, 'search posts')
    console.log('PASS search posts')

    const userPosts = requireSuccess(
      await request<FeedPage<Post>>('GET', `/api/users/${post.authorId}/posts?limit=50`),
      200,
      'list user posts'
    )
    assertPageContains(userPosts, post.id, 'list user posts')
    console.log('PASS list user posts')

    const comment = requireSuccess(
      await request<Comment>('POST', `/api/posts/${post.id}/comments`, { body: { content: `${runId}-comment` } }),
      201,
      'create comment'
    )
    console.log(`PASS create comment (${comment.id})`)

    const comments = requireSuccess(
      await request<FeedPage<Comment>>('GET', `/api/posts/${post.id}/comments?limit=50`),
      200,
      'list comments'
    )
    assertPageContains(comments, comment.id, 'list comments')
    console.log('PASS list comments')

    const reply = requireSuccess(
      await request<Comment>('POST', `/api/posts/${post.id}/comments`, {
        body: { content: `${runId}-reply`, parentCommentId: comment.id },
      }),
      201,
      'create reply'
    )
    const replies = requireSuccess(
      await request<FeedPage<Comment>>('GET', `/api/posts/${post.id}/comments/${comment.id}/replies?limit=50`),
      200,
      'list replies'
    )
    assertPageContains(replies, reply.id, 'list replies')
    console.log('PASS create and list replies')

    const firstPostLike = requireSuccess(
      await request<{ liked: boolean }>('POST', `/api/posts/${post.id}/like`),
      200,
      'like post'
    )
    assert(firstPostLike.liked === true, 'like post: expected liked=true')
    const secondPostLike = requireSuccess(
      await request<{ liked: boolean }>('POST', `/api/posts/${post.id}/like`),
      200,
      'unlike post'
    )
    assert(secondPostLike.liked === false, 'unlike post: expected liked=false')
    console.log('PASS post like toggle')

    const firstCommentLike = requireSuccess(
      await request<{ liked: boolean }>('POST', `/api/posts/${post.id}/comments/${comment.id}/like`),
      200,
      'like comment'
    )
    assert(firstCommentLike.liked === true, 'like comment: expected liked=true')
    const secondCommentLike = requireSuccess(
      await request<{ liked: boolean }>('POST', `/api/posts/${post.id}/comments/${comment.id}/like`),
      200,
      'unlike comment'
    )
    assert(secondCommentLike.liked === false, 'unlike comment: expected liked=false')
    console.log('PASS comment like toggle')

    requireSuccess(await request<null>('DELETE', `/api/posts/${post.id}`), 200, 'soft delete post')
    postId = null
    const deletedPost = await request<Post>('GET', `/api/posts/${post.id}`)
    assert(deletedPost.response.status === 404, `deleted post: expected 404, got ${deletedPost.response.status}`)
    console.log('PASS soft delete post')
  } finally {
    if (postId) {
      const cleanup = await request<null>('DELETE', `/api/posts/${postId}`)
      if (cleanup.response.status !== 200 && cleanup.response.status !== 404) {
        throw new Error(`cleanup: failed to soft-delete ${postId} (${cleanup.response.status})`)
      }
      console.log('PASS cleanup')
    }
  }

  console.log('Social API smoke test completed successfully.')
}

main().catch((error) => {
  console.error(`Social API smoke test failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})

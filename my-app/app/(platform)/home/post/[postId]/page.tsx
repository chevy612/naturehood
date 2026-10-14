import { PostThread } from '@/app/components/platform/social/PostThread'

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  return <PostThread postId={postId} />
}

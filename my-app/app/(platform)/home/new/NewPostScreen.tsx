'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreatePostForm } from '@/app/components/platform/social/CreatePostForm'
import { attachmentFromSearchParams } from '@/lib/social/post-content'

export function NewPostScreen() {
  const params = useSearchParams()
  const attachment = useMemo(
    () => attachmentFromSearchParams(new URLSearchParams(params.toString())),
    [params]
  )
  return <CreatePostForm initialAttachment={attachment} />
}

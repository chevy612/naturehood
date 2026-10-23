import { Suspense } from 'react'
import { NewPostScreen } from './NewPostScreen'

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#141115]" />}>
      <NewPostScreen />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { Button, ButtonMenu } from '@/app/components/ui/buttons'
import { deleteWorkout } from '../actions'

// Header toolbar (Linear-style): primary Edit + "…" menu for secondary actions.
// Delete swaps the toolbar for an inline confirm.
export default function WorkoutActions({ id, hasAiReport }: { id: string; hasAiReport: boolean }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteWorkout(id)
    if (result?.error) {
      setDeleteError(result.error)
      setDeleting(false)
    }
    // redirect happens inside the server action on success
  }

  if (confirmDelete) {
    return (
      <div className="flex shrink-0 items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <span className="hidden text-[12px] text-[#FF4D4D] sm:inline">
          {deleteError ?? 'Delete this workout?'}
        </span>
        <Button variant="ghost" size="sm" onClick={() => { setConfirmDelete(false); setDeleteError(null) }}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button href={`/record/${id}/edit`} variant="outline" size="sm">
        <Pencil size={14} /> Edit
      </Button>
      <ButtonMenu
        ariaLabel="More actions"
        trigger={<MoreHorizontal size={16} />}
        items={[
          ...(hasAiReport
            ? [{ label: 'Edit AI report', icon: <Sparkles />, href: `/record/${id}/ai-report` }]
            : []),
          { label: 'Delete workout', icon: <Trash2 />, tone: 'destructive' as const, onSelect: () => setConfirmDelete(true) },
        ]}
      />
    </div>
  )
}

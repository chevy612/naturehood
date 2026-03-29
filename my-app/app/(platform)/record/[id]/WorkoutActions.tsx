'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteWorkout } from '../actions'

export default function WorkoutActions({ id }: { id: string }) {
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

  return (
    <div className="pt-2 border-t border-[#3A373C]">
      <div className="flex items-center gap-4">
        <Link
          href={`/record/${id}/edit`}
          className="px-5 py-2.5 border border-[#3A373C] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#C8F04D]/40 hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Edit
        </Link>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-5 py-2.5 border border-[#3A373C] text-[#6B6870] text-[12px] font-semibold uppercase tracking-[0.1em] hover:border-[#FF4D4D]/40 hover:text-[#FF4D4D] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] text-[#FF4D4D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Are you sure?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[12px] font-semibold text-[#FF4D4D] hover:text-white transition-colors disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[12px] text-[#6B6870] hover:text-white transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <p
          className="text-[12px] text-[#FF4D4D] mt-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {deleteError}
        </p>
      )}
    </div>
  )
}

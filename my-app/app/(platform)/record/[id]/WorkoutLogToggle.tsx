'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function WorkoutLogToggle({ workoutLog }: { workoutLog: string }) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Training Log
        </p>
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="flex items-center gap-1 text-[11px] text-[#A09EA3] hover:text-[#C8F04D] transition-colors duration-150"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {show ? 'Hide' : 'View log'}
          {show ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {show && (
        <div className="bg-[#1A1719] border border-[#3A373C] p-4">
          <pre
            className="text-[13px] text-[#A09EA3] leading-relaxed whitespace-pre-wrap break-words"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {workoutLog}
          </pre>
        </div>
      )}
    </div>
  )
}

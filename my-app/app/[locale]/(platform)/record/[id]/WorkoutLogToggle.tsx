'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/app/components/ui/buttons'
import { ReportSection, ReportCard } from '@/app/components/platform/ReportSection'

export default function WorkoutLogToggle({ workoutLog, defaultOpen = false }: { workoutLog: string; defaultOpen?: boolean }) {
  const [show, setShow] = useState(defaultOpen)

  return (
    <ReportSection
      title="Training log"
      action={
        <Button variant="ghost" size="sm" onClick={() => setShow(v => !v)}>
          {show ? 'Hide' : 'Show'}
          {show ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      }
    >
      {show && (
        <ReportCard className="px-4 py-3">
          <pre
            className="text-[13px] text-[#A09EA3] leading-relaxed whitespace-pre-wrap break-words"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {workoutLog}
          </pre>
        </ReportCard>
      )}
    </ReportSection>
  )
}

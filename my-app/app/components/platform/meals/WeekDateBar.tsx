'use client'

import { useEffect, useMemo, useRef } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { sans } from '@/lib/social/format'
import { DAY_NAMES, isValidDateKey, monthNameForKey, shiftDateKey, todayDateKey } from '@/lib/meals/utils'

const DAYS_BACK = 60
const DAYS_AHEAD = 3

type DateCell = { key: string; dayAbbr: string; dateNum: number; isFuture: boolean }

function buildDateCells(): DateCell[] {
  const today = todayDateKey()
  const cells: DateCell[] = []
  for (let offset = -DAYS_BACK; offset <= DAYS_AHEAD; offset++) {
    const key = shiftDateKey(today, offset)
    const [year, month, day] = key.split('-').map(Number)
    cells.push({
      key,
      dayAbbr: DAY_NAMES[new Date(year, month - 1, day).getDay()],
      dateNum: day,
      isFuture: offset > 0,
    })
  }
  return cells
}

/**
 * Horizontal day strip: 60 days back plus 3 disabled future days, with a dot on days that
 * have meals, matching the mobile week bar. The month label above it opens a date picker
 * for jumping to any past day.
 */
export function WeekDateBar({
  selectedDate,
  onSelectDate,
  mealDateKeys,
}: {
  selectedDate: string
  onSelectDate: (key: string) => void
  mealDateKeys: ReadonlySet<string>
}) {
  const cells = useMemo(() => buildDateCells(), [])
  const scroller = useRef<HTMLDivElement>(null)
  const dateInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const container = scroller.current
    const cell = container?.querySelector<HTMLElement>(`[data-date="${selectedDate}"]`)
    if (!container || !cell) return
    const left = cell.offsetLeft - container.clientWidth / 2 + cell.clientWidth / 2
    container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [selectedDate])

  return (
    <div>
      <div className="relative w-fit">
        <button
          type="button"
          aria-label={`Pick a date, showing ${monthNameForKey(selectedDate)} ${selectedDate.slice(0, 4)}`}
          onClick={() => {
            const input = dateInput.current
            if (input?.showPicker) input.showPicker()
            else input?.focus()
          }}
          className="-ml-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1E1B1F]"
          style={sans}
        >
          <CalendarDays size={16} className="text-[#A09EA3]" />
          {monthNameForKey(selectedDate)} {selectedDate.slice(0, 4)}
          <ChevronDown size={14} className="text-[#6B6870]" />
        </button>
        <input
          ref={dateInput}
          type="date"
          aria-label="Jump to date"
          tabIndex={-1}
          max={todayDateKey()}
          value={selectedDate}
          onChange={(event) => {
            if (isValidDateKey(event.target.value)) onSelectDate(event.target.value)
          }}
          className="pointer-events-none absolute inset-0 opacity-0"
        />
      </div>
      <div ref={scroller} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="listbox" aria-label="Choose a day">
        {cells.map((cell) => {
          const selected = cell.key === selectedDate
          const hasMeals = mealDateKeys.has(cell.key)
          const tone = selected ? 'text-white' : cell.isFuture ? 'text-[#6B6870]/40' : 'text-[#A09EA3]'
          return (
            <button
              key={cell.key}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={`${cell.key}${hasMeals ? ', has meals' : ''}`}
              data-date={cell.key}
              disabled={cell.isFuture}
              onClick={() => onSelectDate(cell.key)}
              className={`relative flex h-20 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#1E1B1F] sm:w-16 ${selected ? 'border-2 border-white' : 'border-2 border-transparent'} disabled:cursor-not-allowed`}
              style={sans}
            >
              <span className={`text-[18px] font-semibold ${tone}`}>{cell.dateNum}</span>
              <span className={`text-[11px] ${tone}`}>{cell.dayAbbr}</span>
              {hasMeals && !cell.isFuture ? (
                <span className="absolute bottom-2 h-1 w-1 rounded-full bg-[#4ADE80]" aria-hidden />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

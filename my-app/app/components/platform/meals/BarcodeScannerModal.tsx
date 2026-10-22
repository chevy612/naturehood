'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { IScannerControls } from '@zxing/browser'
import type { BarcodeProduct } from '@/lib/meals/barcode'
import { isValidBarcode } from '@/lib/meals/barcode'
import { lookupBarcode } from '@/lib/meals/browser'
import { sans } from '@/lib/social/format'

// ─────────────────────────────────────────────
// BARCODE SCANNER
//   Reads a packaged food's EAN/UPC code with the camera (zxing, so it also works in
//   Safari, which has no BarcodeDetector) and looks the product up. Typing the digits
//   is the fallback when there is no camera or permission is denied.
// ─────────────────────────────────────────────

type Status = 'starting' | 'scanning' | 'no-camera' | 'looking-up'

export function BarcodeScannerModal({
  onProduct,
  onClose,
}: {
  onProduct: (product: BarcodeProduct) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [status, setStatus] = useState<Status>('starting')
  const [scanAttempt, setScanAttempt] = useState(0)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const busyRef = useRef(false)

  async function lookUp(code: string) {
    // The camera reports the same code several times a second; only act on the first.
    if (busyRef.current) return
    busyRef.current = true
    controlsRef.current?.stop()
    setStatus('looking-up')
    setError(null)
    try {
      onProduct(await lookupBarcode(code))
      onClose()
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Could not look up this barcode.')
      setStatus('no-camera')
    } finally {
      busyRef.current = false
    }
  }
  // The scan callback is created once per camera session; keep it pointed at the latest lookUp.
  const lookUpRef = useRef(lookUp)
  useEffect(() => {
    lookUpRef.current = lookUp
  })

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('no-camera')
        return
      }
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ])
      const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ]]])
      const reader = new BrowserMultiFormatReader(hints)
      try {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current ?? undefined,
          (result) => {
            const code = result?.getText()
            if (code && isValidBarcode(code)) void lookUpRef.current(code)
          },
        )
        if (cancelled) controls.stop()
        else {
          controlsRef.current = controls
          setStatus('scanning')
        }
      } catch {
        if (!cancelled) setStatus('no-camera')
      }
    }
    void start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [scanAttempt])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const lookingUp = status === 'looking-up'
  const cameraLive = status === 'starting' || status === 'scanning'

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Scan barcode">
      <button type="button" aria-label="Close scanner" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md rounded-t-3xl border border-[#3A373C] bg-[#141115] p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] text-white" style={sans}>Scan barcode</p>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1B1F] text-white">
            <X size={16} />
          </button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1E1B1F]">
          <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${cameraLive ? '' : 'hidden'}`} />
          {cameraLive ? (
            <div aria-hidden className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-white/70" />
          ) : null}
          <p className="absolute inset-x-0 bottom-3 px-4 text-center text-[12px] text-[#A09EA3]" style={sans} role="status">
            {status === 'starting'
              ? 'Starting camera…'
              : status === 'scanning'
                ? 'Point the camera at the barcode on the pack.'
                : lookingUp
                  ? 'Looking up the product…'
                  : error
                    ? null
                    : 'Camera unavailable. Type the barcode number below.'}
          </p>
          {!cameraLive && !lookingUp && error ? (
            <button
              type="button"
              onClick={() => {
                setError(null)
                setStatus('starting')
                setScanAttempt((attempt) => attempt + 1)
              }}
              className="absolute inset-0 m-auto h-10 w-36 rounded-full bg-[#F5F5F5] text-[13px] font-semibold text-[#141115]"
              style={sans}
            >
              Scan again
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 rounded-xl border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-3 py-2.5 text-[13px] text-[#FF4D4D]" style={sans} role="alert">
            {error}
          </p>
        ) : null}

        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (isValidBarcode(manualCode)) void lookUp(manualCode)
            else setError('Barcodes are 8 to 14 digits.')
          }}
        >
          <label htmlFor="barcode-manual" className="sr-only">Barcode number</label>
          <input
            id="barcode-manual"
            value={manualCode}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Or type the barcode number"
            onChange={(event) => setManualCode(event.target.value.replace(/\D/g, '').slice(0, 14))}
            className="min-w-0 flex-1 rounded-xl bg-[#1E1B1F] px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-[#4A464C] focus:ring-1 focus:ring-white/20"
            style={sans}
          />
          <button
            type="submit"
            disabled={lookingUp || !manualCode}
            className="rounded-full bg-[#F5F5F5] px-4 text-[13px] font-semibold text-[#141115] disabled:opacity-50"
            style={sans}
          >
            Look up
          </button>
        </form>
      </div>
    </div>
  )
}

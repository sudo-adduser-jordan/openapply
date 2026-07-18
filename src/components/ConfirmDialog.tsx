'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    message?: string
    confirmLabel?: string
}

export function ConfirmDialog({ open, onConfirm, onCancel, message = 'Are you sure?', confirmLabel = 'Clear' }: ConfirmDialogProps) {
    const confirmRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!open) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', handleKeyDown)
        confirmRef.current?.focus()
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onCancel])

    if (!open) return null

    return (
        <div className='absolute right-0 top-full z-50 mt-1.5 min-w-[160px] rounded-lg border border-[var(--line)] bg-[var(--paper-3)] p-2 shadow-xl'>
            <p className='px-1 pb-1.5 text-[12px] text-[var(--ink)] leading-snug'>{message}</p>
            <div className='flex gap-1.5 justify-end'>
                <button
                    onClick={onCancel}
                    className='px-2 py-0.5 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] rounded-md transition-colors'
                >
                    Cancel
                </button>
                <button
                    ref={confirmRef}
                    onClick={onConfirm}
                    className='px-2 py-0.5 text-[11px] font-medium text-white bg-red-500/60 hover:bg-red-500/80 rounded-md transition-colors'
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    )
}

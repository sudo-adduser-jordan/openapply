'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface ClearAllConfirmProps {
    message: string
    onClear: () => void
    confirmLabel?: string
}

export function ClearAllConfirm({ message, onClear, confirmLabel = 'Clear All' }: ClearAllConfirmProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className='relative'>
            <button
                onClick={() => setOpen(true)}
                className='text-[11px] text-red-400/80 hover:text-red-400 transition-colors font-medium'
            >
                {confirmLabel}
            </button>
            <ConfirmDialog
                open={open}
                onConfirm={() => {
                    onClear()
                    setOpen(false)
                }}
                onCancel={() => setOpen(false)}
                message={message}
                confirmLabel={confirmLabel}
            />
        </div>
    )
}

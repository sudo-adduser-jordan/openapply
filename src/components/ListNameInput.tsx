'use client'

import type { KeyboardEvent, RefObject } from 'react'

interface ListNameInputProps {
    value: string
    onChange: (value: string) => void
    onCreate: () => void
    onCancel: () => void
    autoFocus?: boolean
    className?: string
    inputRef?: RefObject<HTMLInputElement | null>
}

export function ListNameInput({ value, onChange, onCreate, onCancel, autoFocus, className, inputRef }: ListNameInputProps) {
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault()
            onCreate()
        }
        if (e.key === 'Escape') {
            onCancel()
        }
    }

    return (
        <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='List name…'
            autoFocus={autoFocus}
            className={className}
        />
    )
}

'use client'

import clsx from 'clsx'
import type { WatchlistCategory } from '@/types'

interface CategoryTabProps {
    cat: WatchlistCategory
    isActive: boolean
    onSelect: () => void
}

export function CategoryTab({ cat, isActive, onSelect }: CategoryTabProps) {
    return (
        <div
            onClick={onSelect}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
            }}
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium transition-colors whitespace-nowrap border cursor-pointer shrink-0',
                isActive
                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                    : 'bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--hover-bg)]',
            )}
        >
            <span>{cat.name}</span>
            <span className={clsx('text-[10px]', isActive ? 'text-violet-400/70' : 'text-[var(--ink-mute)]')}>
                {cat.companies.length}
            </span>
        </div>
    )
}

'use client'

import clsx from 'clsx'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const pageBtn = (active: boolean) =>
    clsx(
        'inline-flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-md px-2 text-[13px] font-medium transition-colors',
        active
            ? 'bg-[var(--violet-tint)] text-[var(--violet-deep)]'
            : 'text-[var(--ink-soft)] hover:bg-[var(--paper-3)] hover:text-[var(--ink)]',
    )

function buildPageList(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const wanted = new Set<number>([1, total, current, current - 1, current + 1])
    const sorted = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
    const out: (number | '…')[] = []
    let prev = 0
    for (const p of sorted) {
        if (p - prev > 1) out.push('…')
        out.push(p)
        prev = p
    }
    return out
}

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <nav className='flex flex-wrap items-center justify-center gap-1.5 pt-1' aria-label='Pagination'>
            <button
                type='button'
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className='inline-flex h-8 cursor-pointer items-center gap-1 rounded-md pl-1.5 pr-2.5 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40'
            >
                <ChevronLeftIcon width={15} height={15} />
                Prev
            </button>
            {buildPageList(currentPage, totalPages).map((p, idx) =>
                p === '…' ? (
                    <span key={`ellipsis-${idx}`} className='px-1 text-[13px] text-[var(--ink-faint)]'>
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        type='button'
                        onClick={() => onPageChange(p)}
                        className={pageBtn(p === currentPage)}
                        aria-current={p === currentPage ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ),
            )}
            <button
                type='button'
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className='inline-flex h-8 cursor-pointer items-center gap-1 rounded-md pl-2.5 pr-1.5 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40'
            >
                Next
                <ChevronRightIcon width={15} height={15} />
            </button>
        </nav>
    )
}

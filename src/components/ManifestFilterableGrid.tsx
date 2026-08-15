'use client'

import { useState, useMemo } from 'react'
import { SearchIcon } from './icons'

interface CardItem {
    name: string
    element: React.ReactNode
}

interface ManifestFilterableGridProps {
    label: string
    dotColor: string
    fileCount: number
    filterPlaceholder: string
    cards: CardItem[]
    maxItems?: number
}

export function ManifestFilterableGrid({
    label,
    dotColor,
    fileCount,
    filterPlaceholder,
    cards,
    maxItems = 10,
}: ManifestFilterableGridProps) {
    const [filter, setFilter] = useState('')

    const filtered = useMemo(() => {
        const q = filter.toLowerCase()
        const matching = q ? cards.filter((c) => c.name.toLowerCase().includes(q)) : cards
        return q ? matching : matching.slice(0, maxItems)
    }, [filter, cards, maxItems])

    const visibleCount = filtered.length
    const colsLg = 3
    const spacerCountLg = (colsLg - (visibleCount % colsLg)) % colsLg

    return (
        <section>
            <div className='mb-4 flex items-center justify-between gap-3'>
                <span className='inline-flex items-center gap-1.5 rounded-md bg-[var(--paper-3)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]'>
                    <span aria-hidden='true' className='inline-block size-1.5 rounded-full' style={{ background: dotColor }} />
                    {label}
                </span>
                <span className='text-xs text-[var(--muted)]'>{fileCount} files</span>
            </div>
            <div className='relative mb-4 flex items-center rounded-md border-2 border-dotted border-[var(--line-strong)] bg-[var(--paper)] transition-colors focus-within:border-[var(--brand)]'>
                <span
                    aria-hidden='true'
                    className='pointer-events-none flex h-10 w-10 items-center justify-center text-[var(--muted)] max-sm:h-8 max-sm:w-8'
                >
                    <SearchIcon className='h-4 w-4' />
                </span>
                <input
                    placeholder={filterPlaceholder}
                    spellCheck={false}
                    autoCorrect='off'
                    autoCapitalize='off'
                    className='h-10 flex-1 bg-transparent pr-3 text-sm placeholder:text-[var(--muted)] focus:outline-none max-sm:h-8 max-sm:text-[12px]'
                    type='text'
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <ul className='grid grid-cols-1 gap-px overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-3'>
                {filtered.map((card) => (
                    <li key={card.name}>{card.element}</li>
                ))}
                {spacerCountLg > 0 &&
                    Array.from({ length: spacerCountLg }).map((_, i) => (
                        <li key={`spacer-${i}`} aria-hidden='true' className='bg-[var(--paper)] hidden md:block'>
                            <div className='h-full w-full min-h-[104px]' />
                        </li>
                    ))}
            </ul>
        </section>
    )
}

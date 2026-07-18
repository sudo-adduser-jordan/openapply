'use client'

import { useMemo } from 'react'
import clsx from 'clsx'
import { SearchField } from './SearchField'
import { Checkmark, XIcon, MinusIcon } from './icons'

function CheckIcon() {
    return <Checkmark strokeWidth={3} className='size-3' />
}

function MinusCheckIcon() {
    return <MinusIcon strokeWidth={3} className='size-3' />
}

interface SelectListProps {
    title: string
    placeholder: string
    items: string[]
    included: string[]
    excluded: string[]
    searchText: string
    onSearchChange: (v: string) => void
    onCycle: (v: string) => void
    onClear: () => void
    uppercase?: boolean
}

export function SelectList({
    title,
    placeholder,
    items,
    included,
    excluded,
    searchText,
    onSearchChange,
    onCycle,
    onClear,
    uppercase = false,
}: SelectListProps) {
    const includedSet = useMemo(() => new Set(included), [included])
    const excludedSet = useMemo(() => new Set(excluded), [excluded])
    const total = included.length + excluded.length

    const chip = (v: string, mode: 'inc' | 'exc') => (
        <button
            key={`${mode}-${v}`}
            onClick={() => onCycle(v)}
            title={mode === 'inc' ? 'Including — click to exclude' : 'Excluding — click to clear'}
            className={clsx(
                'inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-medium',
                uppercase && 'uppercase',
                mode === 'inc'
                    ? 'bg-[var(--violet-tint)] text-[var(--violet-deep)]'
                    : 'bg-[color-mix(in_oklab,#ef4444_18%,transparent)] text-[#fca5a5]',
            )}
        >
            {mode === 'exc' && <span className='font-semibold'>−</span>}
            <span className='max-w-[140px] truncate'>{v}</span>
            <XIcon strokeWidth={2.5} className='size-3 shrink-0' />
        </button>
    )

    return (
        <div>
            <div className='mb-2 flex items-center justify-between'>
                <label className='text-[13px] font-medium text-[var(--ink)]'>
                    {title}
                    {total > 0 && (
                        <span className='ml-1.5 text-[var(--ink-mute)]'>
                            ({included.length > 0 && `${included.length} incl`}
                            {included.length > 0 && excluded.length > 0 && ' · '}
                            {excluded.length > 0 && `${excluded.length} excl`})
                        </span>
                    )}
                </label>
                {total > 0 && (
                    <button onClick={onClear} className='text-[11px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]'>
                        Clear
                    </button>
                )}
            </div>

            {total > 0 && (
                <div className='mb-2 flex max-h-[64px] flex-wrap gap-1.5 overflow-y-auto'>
                    {included.map((v) => chip(v, 'inc'))}
                    {excluded.map((v) => chip(v, 'exc'))}
                </div>
            )}

            <SearchField value={searchText} onChange={onSearchChange} placeholder={placeholder} className='mb-2' />

            <div className='h-[190px] overflow-y-auto overscroll-contain rounded-xl border border-[var(--line)] p-1.5'>
                {items.length === 0 ? (
                    <div className='p-4 text-center text-[13px] text-[var(--ink-mute)]'>No matches</div>
                ) : (
                    items.map((item, i) => {
                        const isIncluded = includedSet.has(item)
                        const isExcluded = excludedSet.has(item)
                        const stateOf = (it: string) => (includedSet.has(it) ? 'inc' : excludedSet.has(it) ? 'exc' : 'none')
                        const st = stateOf(item)
                        const prevSame = st !== 'none' && i > 0 && stateOf(items[i - 1]) === st
                        const nextSame = st !== 'none' && i < items.length - 1 && stateOf(items[i + 1]) === st
                        return (
                            <button
                                key={item}
                                onClick={() => onCycle(item)}
                                title={isIncluded ? 'Click to exclude' : isExcluded ? 'Click to clear' : 'Click to include'}
                                className={clsx(
                                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors',
                                    uppercase && 'uppercase',
                                    prevSame && 'rounded-t-none',
                                    nextSame && 'rounded-b-none',
                                    isIncluded
                                        ? 'bg-[var(--violet-tint)] text-[var(--violet-deep)]'
                                        : isExcluded
                                          ? 'bg-[color-mix(in_oklab,#ef4444_14%,transparent)] text-[#fca5a5] line-through decoration-[#fca5a5]/40'
                                          : 'text-[var(--ink-soft)] hover:bg-[var(--paper-3)] hover:text-[var(--ink)]',
                                )}
                            >
                                <span
                                    className={clsx(
                                        'grid size-[15px] shrink-0 place-items-center rounded-[4px] border transition-colors',
                                        isIncluded
                                            ? 'border-[var(--violet-solid)] bg-[var(--violet-solid)] text-white'
                                            : isExcluded
                                              ? 'border-[#ef4444] bg-[#ef4444] text-white'
                                              : 'border-[var(--line-strong)]',
                                    )}
                                >
                                    {isIncluded && <CheckIcon />}
                                    {isExcluded && <MinusCheckIcon />}
                                </span>
                                <span className='truncate'>{item}</span>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSavedCompanies } from '@/hooks/use-saved-companies'
import clsx from 'clsx'
import { ListNameInput } from '@/components/ListNameInput'
import { ChevronDownIcon, StarIcon, PlusIcon } from './icons'

interface SaveCompanyButtonProps {
    name: string
    slug: string
    variant?: 'icon' | 'button' | 'compact'
    className?: string
}

export function SaveCompanyButton({ name, slug, variant = 'compact', className }: SaveCompanyButtonProps) {
    const { isSaved, toggleSave, watchlists, activeListId, createList, isInList, addToList, removeFromList } = useSavedCompanies()

    const [hydrated, setHydrated] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [creating, setCreating] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setHydrated(true)
    }, [])

    const inActiveList = isInList(name, activeListId)
    const displayInActiveList = hydrated && inActiveList

    useEffect(() => {
        if (!popoverOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopoverOpen(false)
                setCreating(false)
                setNewListName('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [popoverOpen])

    const handleMainClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSave(name, slug)
        },
        [toggleSave, name, slug],
    )

    const handleDropdownClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setPopoverOpen((prev) => !prev)
    }, [])

    const handleListToggle = useCallback(
        (listId: string) => {
            if (isInList(name, listId)) {
                removeFromList(name, listId)
            } else {
                addToList(name, slug, listId)
            }
        },
        [name, slug, isInList, removeFromList, addToList],
    )

    const handleCreateList = useCallback(() => {
        const trimmed = newListName.trim()
        if (!trimmed) return
        const id = createList(trimmed)
        addToList(name, slug, id)
        setNewListName('')
        setCreating(false)
        setPopoverOpen(false)
    }, [newListName, createList, addToList, name, slug])

    const makeDropdownIcon = (extraClass?: string) => (
        <ChevronDownIcon width={8} height={8} className={extraClass} />
    )

    if (variant === 'icon') {
        return (
            <div className='relative inline-flex items-center'>
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleSave(name, slug)
                    }}
                    className={clsx(
                        'transition-colors duration-200',
                        displayInActiveList ? 'text-blue-400 hover:text-blue-300' : 'text-[var(--ink-mute)] hover:text-[var(--ink-soft)]',
                        className,
                    )}
                    aria-label={displayInActiveList ? 'Remove from watchlist' : 'Add to watchlist'}
                    title={displayInActiveList ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                    <StarIcon
                        width={14}
                        height={14}
                        fill={displayInActiveList ? 'currentColor' : 'none'}
                        stroke='currentColor'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </button>
                {
                    <button
                        onClick={handleDropdownClick}
                        className='ml-px p-0.5 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition-colors'
                        aria-label='Select watchlist'
                    >
                        {makeDropdownIcon()}
                    </button>
                }
                {popoverOpen && <ListPopover />}
            </div>
        )
    }

    if (variant === 'button') {
        return (
            <div className='relative inline-flex items-center'>
                <button
                    onClick={handleMainClick}
                    className={clsx(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-[12px] font-medium',
                        'border border-r-0 transition-[border-color,background-color] duration-200 ease-in-out',
                        displayInActiveList
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/40'
                            : 'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] hover:border-[var(--line-strong)]',
                        className,
                    )}
                    aria-label={displayInActiveList ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                    <StarIcon
                        width={14}
                        height={14}
                        fill={displayInActiveList ? 'currentColor' : 'none'}
                        stroke='currentColor'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    {isSaved(name) ? (displayInActiveList ? 'Watching' : 'Watched') : 'Watch'}
                </button>
                {
                    <button
                        onClick={handleDropdownClick}
                        className={clsx(
                            'inline-flex items-center px-1.5 py-1.5 rounded-r-full text-[12px] font-medium',
                            'border transition-[border-color,background-color] duration-200 ease-in-out',
                            displayInActiveList
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                                : 'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)]',
                        )}
                        aria-label='Select watchlist'
                    >
                        {makeDropdownIcon()}
                    </button>
                }
                {popoverOpen && <ListPopover />}
            </div>
        )
    }

    return (
        <div className='relative inline-flex items-center'>
            <button
                onClick={handleMainClick}
                className={clsx(
                    'inline-flex items-center gap-1 px-[10px] py-0.5 text-[11px] md:text-[12px] font-medium',
                    'rounded-l-full border-r-0',
                    'border transition-[border-color,background-color] duration-200 ease-in-out',
                    displayInActiveList
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/40'
                        : 'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] hover:border-[var(--line-strong)]',
                    className,
                )}
                aria-label={displayInActiveList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                    <StarIcon
                        width={10}
                        height={10}
                        className='md:w-[11px] md:h-[11px]'
                        fill={displayInActiveList ? 'currentColor' : 'none'}
                        stroke='currentColor'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                {isSaved(name) ? (displayInActiveList ? 'Watching' : 'Watched') : 'Watch'}
            </button>
            {
                <button
                    onClick={handleDropdownClick}
                    className={clsx(
                        'inline-flex items-center px-1 py-0.5 rounded-r-full text-[11px] md:text-[12px] font-medium',
                        'border transition-[border-color,background-color] duration-200 ease-in-out',
                        displayInActiveList
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                            : 'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)]',
                    )}
                    aria-label='Select watchlist'
                >
                    {makeDropdownIcon()}
                </button>
            }
            {popoverOpen && <ListPopover />}
        </div>
    )

    function ListPopover() {
        return (
            <div
                ref={popoverRef}
                className='absolute right-0 top-full z-50 mt-1.5 min-w-[200px] rounded-xl border border-[var(--line)] bg-[var(--paper-3)] shadow-xl'
            >
                <div className='px-3 py-2 text-[11px] font-medium text-[var(--ink-mute)] uppercase tracking-wider'>Watchlists</div>
                <div className='max-h-[200px] overflow-y-auto'>
                    {watchlists.map((list) => {
                        const inList = isInList(name, list.id)
                        return (
                            <button
                                key={list.id}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleListToggle(list.id)
                                }}
                                className='flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--ink)] hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] transition-colors'
                            >
                                <StarIcon
                                    width={12}
                                    height={12}
                                    fill={inList ? 'currentColor' : 'none'}
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className={clsx('shrink-0', inList ? 'text-blue-400' : 'text-[var(--ink-mute)]')}
                                />
                                <span className='flex-1 truncate'>{list.name}</span>
                                {list.id === activeListId && <span className='text-[10px] text-[var(--ink-mute)]'>Active</span>}
                            </button>
                        )
                    })}
                </div>
                {creating ? (
                    <div className='border-t border-[var(--line)] px-3 py-2'>
                        <ListNameInput
                            value={newListName}
                            onChange={setNewListName}
                            onCreate={handleCreateList}
                            onCancel={() => { setCreating(false); setNewListName('') }}
                            autoFocus
                            className='w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] outline-none focus:border-blue-400/50'
                        />
                        <div className='mt-1.5 flex gap-1.5 justify-end'>
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCreating(false)
                                    setNewListName('')
                                }}
                                className='px-2 py-0.5 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] rounded-md transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleCreateList()
                                }}
                                disabled={!newListName.trim()}
                                className='px-2 py-0.5 text-[11px] font-medium text-white bg-blue-500/60 hover:bg-blue-500/80 rounded-md transition-colors disabled:opacity-40'
                            >
                                Create
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCreating(true)
                        }}
                        className='flex w-full items-center gap-2 border-t border-[var(--line)] px-3 py-2 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] transition-colors rounded-b-xl'
                    >
                    <PlusIcon width={12} height={12} />
                        New List
                    </button>
                )}
            </div>
        )
    }
}

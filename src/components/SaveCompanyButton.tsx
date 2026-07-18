'use client'

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react'
import { useSavedCompanies } from '@/hooks/use-saved-companies'
import clsx from 'clsx'
import { ListPopover } from '@/components/ListPopover'
import { ChevronDownIcon, StarIcon } from './icons'

interface SaveCompanyButtonProps {
    name: string
    slug: string
    variant?: 'icon' | 'button' | 'compact'
    className?: string
}

export function SaveCompanyButton({ name, slug, variant = 'compact', className }: SaveCompanyButtonProps) {
    const { isSaved, toggleSave, watchlists, activeListId, createList, isInList, addToList, removeFromList } = useSavedCompanies()

    const [popoverOpen, setPopoverOpen] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [creating, setCreating] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    const hydrated = useSyncExternalStore(
        useCallback(() => () => {}, []),
        () => true,
        () => false,
    )

    const inActiveList = isInList(name, activeListId)
    const displayInActiveList = hydrated && inActiveList
    const showDropdown = watchlists.length > 1

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

    const dropdownSection = (buttonClassName: string) => (
        <>
            {
                <button onClick={handleDropdownClick} className={buttonClassName} aria-label='Select watchlist'>
                    {makeDropdownIcon()}
                </button>
            }
            {popoverOpen && (
                <ListPopover
                    popoverRef={popoverRef}
                    watchlists={watchlists}
                    isInList={isInList}
                    name={name}
                    activeListId={activeListId}
                    creating={creating}
                    newListName={newListName}
                    setNewListName={setNewListName}
                    handleListToggle={handleListToggle}
                    handleCreateList={handleCreateList}
                    setCreating={setCreating}
                    onClose={() => setPopoverOpen(false)}
                />
            )}
        </>
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
                {showDropdown && dropdownSection('ml-px p-0.5 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition-colors')}
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
                {showDropdown && dropdownSection(clsx(
                    'inline-flex items-center px-1.5 py-1.5 rounded-r-full text-[12px] font-medium',
                    'border transition-[border-color,background-color] duration-200 ease-in-out',
                    displayInActiveList
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                        : 'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)]',
                ))}
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
            {showDropdown && dropdownSection(clsx(
                'inline-flex items-center px-1 py-0.5 rounded-r-full text-[11px] md:text-[12px] font-medium',
                'border transition-[border-color,background-color] duration-200 ease-in-out',
                displayInActiveList
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                    : 'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)]',
            ))}
        </div>
    )
}

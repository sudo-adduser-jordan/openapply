'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { ClearAllConfirm } from '@/components/ClearAllConfirm'
import { ListNameInput } from '@/components/ListNameInput'
import Link from 'next/link'
import { useSavedCompanies } from '@/hooks/use-saved-companies'
import type { JobMarker, WatchlistItem } from '@/types'
import type { WatchlistCategory } from '@/types'
import { Building, XIcon, PlusIcon, SearchIcon } from './icons'
import { ListTab } from './ListTab'
import { CategoryTab } from './CategoryTab'
import { WatchlistCompanyCard } from './WatchlistCompanyCard'

function LoadingSkeleton() {
    return (
        <div className='space-y-6'>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className='rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--fg)_2.5%,transparent)] p-4 space-y-3'
                >
                    <div className='h-6 w-1/3 bg-white/10 rounded animate-pulse' />
                    <div className='space-y-2'>
                        {[1, 2, 3].map((j) => (
                            <div key={j} className='h-12 bg-white/5 rounded animate-pulse' />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

const DEFAULT_LIST_ID = 'default'

interface WatchlistContentProps {
    jobs: JobMarker[]
    watchlistCategories: WatchlistCategory[]
}

export function WatchlistContent({ jobs: allJobs, watchlistCategories: categories }: WatchlistContentProps) {
    const {
        clearAll,
        isLoading: loadingCompanies,
        watchlists,
        activeListId,
        setActiveListId,
        createList,
        renameList,
        deleteList,
        itemsForList,
    } = useSavedCompanies()

    const [creating, setCreating] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [renamingListId, setRenamingListId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const createInputRef = useRef<HTMLInputElement>(null)
    const renameInputRef = useRef<HTMLInputElement>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

    const activeItems = useMemo(() => itemsForList(activeListId), [itemsForList, activeListId])

    const activeCompanyNames = useMemo(() => activeItems.map((item) => item.name), [activeItems])

    const activeCategory = activeCategoryId ? (categories.find((c) => c.id === activeCategoryId) ?? null) : null

    const activeFilteredCompanies = useMemo(() => {
        if (activeCategory) {
            if (!searchQuery.trim()) return activeCategory.companies
            const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean)
            return activeCategory.companies.filter((c) => terms.every((t) => c.name.toLowerCase().includes(t)))
        }
        if (!searchQuery.trim()) return activeItems
        const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean)
        return activeItems.filter((item) => terms.every((t) => item.name.toLowerCase().includes(t)))
    }, [activeCategory, activeItems, searchQuery])

    const hasContent = activeCategory ? activeFilteredCompanies.length > 0 : activeItems.length > 0

    const isLoading = loadingCompanies
    const activeList = watchlists.find((l) => l.id === activeListId)

    useEffect(() => {
        if (creating && createInputRef.current) {
            createInputRef.current.focus()
        }
    }, [creating])

    useEffect(() => {
        if (renamingListId && renameInputRef.current) {
            renameInputRef.current.focus()
            renameInputRef.current.select()
        }
    }, [renamingListId])

    const handleCreateList = useCallback(() => {
        const trimmed = newListName.trim()
        if (!trimmed) return
        const id = createList(trimmed)
        setActiveListId(id)
        setNewListName('')
        setCreating(false)
    }, [newListName, createList, setActiveListId])

    const handleStartRename = useCallback((list: { id: string; name: string }) => {
        setRenamingListId(list.id)
        setRenameValue(list.name)
    }, [])

    const handleFinishRename = useCallback(() => {
        if (renamingListId && renameValue.trim()) {
            renameList(renamingListId, renameValue.trim())
        }
        setRenamingListId(null)
        setRenameValue('')
    }, [renamingListId, renameValue, renameList])

    const handleDelete = useCallback(
        (id: string) => {
            deleteList(id)
            setConfirmDeleteId(null)
        },
        [deleteList],
    )

    return (
        <div className='space-y-4'>
            {/* List tabs */}
            <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin'>
                {watchlists.map((list) => {
                    const count = itemsForList(list.id).length
                    const isActive = list.id === activeListId && !activeCategoryId
                    const isRenaming = renamingListId === list.id
                    const showDelete = confirmDeleteId === list.id

                    return (
                        <ListTab
                            key={list.id}
                            list={list}
                            isActive={isActive}
                            count={count}
                            isRenaming={isRenaming}
                            renameValue={renameValue}
                            onRenameChange={setRenameValue}
                            onFinishRename={handleFinishRename}
                            onCancelRename={() => { setRenamingListId(null); setRenameValue('') }}
                            onSelect={() => { setActiveListId(list.id); setActiveCategoryId(null) }}
                            onStartRename={() => handleStartRename(list)}
                            showDelete={showDelete}
                            onConfirmDelete={() => setConfirmDeleteId(list.id)}
                            onCancelDelete={() => setConfirmDeleteId(null)}
                            onDelete={() => handleDelete(list.id)}
                        />
                    )
                })}

                {categories.filter((cat) => cat.id !== DEFAULT_LIST_ID).length > 0 && (
                    <div className='mx-1.5 h-5 w-px bg-[var(--line)] shrink-0' aria-hidden='true' />
                )}
                {categories
                    .filter((cat) => cat.id !== DEFAULT_LIST_ID)
                    .map((cat) => (
                        <CategoryTab
                            key={cat.id}
                            cat={cat}
                            isActive={activeCategoryId === cat.id}
                            onSelect={() => {
                                setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)
                                if (activeCategoryId !== cat.id) setSearchQuery('')
                            }}
                        />
                    ))}

                {creating ? (
                    <div className='flex items-center gap-1.5 shrink-0 rounded-md border border-blue-400/50 bg-[var(--bg)] px-2 py-1'>
                        <ListNameInput
                            inputRef={createInputRef}
                            value={newListName}
                            onChange={setNewListName}
                            onCreate={handleCreateList}
                            onCancel={() => { setCreating(false); setNewListName('') }}
                            className='w-24 bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)]'
                        />
                        <button
                            onClick={() => { setCreating(false); setNewListName('') }}
                            className='text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors'
                        >
                            <XIcon width={12} height={12} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => { setCreating(true); setNewListName('') }}
                        className='inline-flex items-center gap-1 rounded-md border border-dashed border-[var(--line)] px-3 py-1 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors shrink-0'
                    >
                        <PlusIcon width={12} height={12} />
                        New List
                    </button>
                )}
            </div>

            {/* Search */}
            <div className='relative'>
                <SearchIcon
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none'
                    width={14}
                    height={14}
                />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search companies across all watchlists…'
                    className='w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] transition-colors focus:border-blue-400/50 max-sm:py-1.5 max-sm:text-[12px]'
                />
            </div>

            {/* Stats line */}
            {!activeCategory && hasContent && (
                <div className='flex items-center justify-between'>
                    <div className='text-[13px] text-[var(--ink-mute)]'>
                        {activeItems.length} compan{activeItems.length === 1 ? 'y' : 'ies'} in{' '}
                        <span className='font-medium text-[var(--ink)]'>{activeList?.name ?? 'Default'}</span>
                    </div>
                    <ClearAllConfirm message='Clear all companies from all lists?' onClear={clearAll} />
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : !hasContent ? (
                <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
                    <div className='w-16 h-16 rounded-full bg-[var(--paper-3)] border border-[var(--line)] flex items-center justify-center mb-4'>
                        <Building width={32} height={32} className='text-[var(--ink-mute)]' />
                    </div>
                    <h2 className='text-[18px] text-[var(--ink)] font-medium mb-2'>
                        {searchQuery ? 'No matching companies' : 'No companies in this list'}
                    </h2>
                    <p className='text-[14px] text-[var(--ink-mute)] mb-6 max-w-sm'>
                        {activeCategory
                            ? 'Browse another watchlist above or search across all lists'
                            : watchlists.length > 1
                              ? 'Switch to another list or add companies from the map or companies page'
                              : 'Start watching companies to track their job openings here'}
                    </p>
                    <div className='flex gap-3'>
                        <Link
                            href='/companies'
                            className='inline-flex items-center gap-2 px-4 py-2 bg-[var(--paper-3)] text-[var(--ink)] rounded-md border border-[var(--line)] text-[13px] font-medium no-underline transition-[border-color,background-color] duration-200 hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]'
                        >
                            Browse Companies
                        </Link>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
                    {(activeCategory ? activeFilteredCompanies : activeItems).map((entry: { name: string } | WatchlistItem) => (
                        <WatchlistCompanyCard
                            key={entry.name}
                            name={entry.name}
                            allJobs={allJobs}
                            activeCategory={Boolean(activeCategory)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

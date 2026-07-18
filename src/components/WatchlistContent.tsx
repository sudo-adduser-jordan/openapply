'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { ClearAllConfirm } from '@/components/ClearAllConfirm'
import Link from 'next/link'
import clsx from 'clsx'
import { useSavedCompanies } from '@/hooks/use-saved-companies'
import { SaveCompanyButton } from '@/components/SaveCompanyButton'
import { useClientJobs } from '@/hooks/use-client-jobs'
import { generateCompanySlug } from '@/utils/format'
import type { JobMarker, WatchlistItem } from '@/types'
import type { WatchlistCategory } from '@/types'
import { Building, PencilIcon, XIcon, PlusIcon, SearchIcon } from './icons'

const JOBS_PER_PAGE = 50
const RECENT_DAYS = 14

function hasRecentJobs(companyName: string, allJobs: JobMarker[] | null): boolean {
    if (!allJobs) return false
    const now = Date.now()
    const cutoff = now - RECENT_DAYS * 24 * 60 * 60 * 1000
    return allJobs.some((job) => {
        if (job.company !== companyName || !job.posted_at) return false
        const t = new Date(job.posted_at).getTime()
        return !isNaN(t) && t >= cutoff && t <= now
    })
}

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

export function WatchlistContent() {
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
    const allJobs = useClientJobs()

    const [creating, setCreating] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [renamingListId, setRenamingListId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const createInputRef = useRef<HTMLInputElement>(null)
    const renameInputRef = useRef<HTMLInputElement>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [categories, setCategories] = useState<WatchlistCategory[]>([])
    const [categoriesLoaded, setCategoriesLoaded] = useState(false)

    useEffect(() => {
        if (categoriesLoaded) return
        fetch('/api/watchlist')
            .then((r) => r.json())
            .then((data: { categories: WatchlistCategory[] }) => {
                if (data.categories) {
                    setCategories(data.categories)
                }
            })
            .catch(() => {})
            .finally(() => setCategoriesLoaded(true))
    }, [categoriesLoaded])

    const activeItems = useMemo(() => itemsForList(activeListId), [itemsForList, activeListId])

    const activeCompanyNames = useMemo(() => activeItems.map((item) => item.name), [activeItems])

    const groupedJobs = useMemo(() => {
        if (!allJobs) return new Map<string, JobMarker[]>()
        const map = new Map<string, JobMarker[]>()
        for (const name of activeCompanyNames) {
            const companyJobs = allJobs.filter((j) => j.company === name).slice(0, JOBS_PER_PAGE)
            if (companyJobs.length > 0) {
                map.set(name, companyJobs)
            }
        }
        return map
    }, [allJobs, activeCompanyNames])

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

    const isLoading = loadingCompanies || !allJobs
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
                        <div key={list.id} className='relative shrink-0'>
                            {isRenaming ? (
                                <div className='flex items-center rounded-full border border-blue-400/50 bg-[var(--bg)] px-2 py-1'>
                                    <input
                                        ref={renameInputRef}
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleFinishRename()
                                            }
                                            if (e.key === 'Escape') {
                                                setRenamingListId(null)
                                                setRenameValue('')
                                            }
                                        }}
                                        onBlur={handleFinishRename}
                                        className='w-24 bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)]'
                                        placeholder='List name'
                                    />
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        setActiveListId(list.id)
                                        setActiveCategoryId(null)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setActiveListId(list.id)
                                            setActiveCategoryId(null)
                                        }
                                    }}
                                    role='button'
                                    tabIndex={0}
                                    className={clsx(
                                        'group relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors whitespace-nowrap border cursor-pointer',
                                        isActive
                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                            : 'bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]',
                                    )}
                                >
                                    <span>{list.name}</span>
                                    <span className={clsx('text-[10px]', isActive ? 'text-blue-400/70' : 'text-[var(--ink-mute)]')}>
                                        {count}
                                    </span>
                                    {!isActive && list.id !== DEFAULT_LIST_ID && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleStartRename(list)
                                            }}
                                            className='ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ink-mute)] hover:text-[var(--ink)]'
                                            aria-label={`Rename ${list.name}`}
                                        >
                                        <PencilIcon width={10} height={10} />
                                        </button>
                                    )}
                                    {!isActive && list.id !== DEFAULT_LIST_ID && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setConfirmDeleteId(list.id)
                                            }}
                                            className='ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ink-mute)] hover:text-red-400'
                                            aria-label={`Delete ${list.name}`}
                                        >
                                        <XIcon width={10} height={10} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {showDelete && (
                                <div className='absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 min-w-[140px] rounded-lg border border-[var(--line)] bg-[var(--paper-3)] p-2 shadow-xl'>
                                    <p className='text-[11px] text-[var(--ink)] mb-2 px-1'>Delete &ldquo;{list.name}&rdquo;?</p>
                                    <div className='flex gap-1.5 justify-end'>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setConfirmDeleteId(null)
                                            }}
                                            className='px-2 py-0.5 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] rounded-md transition-colors'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleDelete(list.id)
                                            }}
                                            className='px-2 py-0.5 text-[11px] font-medium text-white bg-red-500/60 hover:bg-red-500/80 rounded-md transition-colors'
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {categories.filter((cat) => cat.id !== DEFAULT_LIST_ID).length > 0 && (
                    <div className='mx-1.5 h-5 w-px bg-[var(--line)] shrink-0' aria-hidden='true' />
                )}
                {categories
                    .filter((cat) => cat.id !== DEFAULT_LIST_ID)
                    .map((cat) => {
                        const isActive = activeCategoryId === cat.id
                        return (
                            <div
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)
                                    if (activeCategoryId !== cat.id) setSearchQuery('')
                                }}
                                role='button'
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)
                                        if (activeCategoryId !== cat.id) setSearchQuery('')
                                    }
                                }}
                                className={clsx(
                                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors whitespace-nowrap border cursor-pointer shrink-0',
                                    isActive
                                        ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                                        : 'bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]',
                                )}
                            >
                                <span>{cat.name}</span>
                                <span className={clsx('text-[10px]', isActive ? 'text-violet-400/70' : 'text-[var(--ink-mute)]')}>
                                    {cat.companies.length}
                                </span>
                            </div>
                        )
                    })}

                {creating ? (
                    <div className='flex items-center gap-1.5 shrink-0 rounded-full border border-blue-400/50 bg-[var(--bg)] px-2 py-1'>
                        <input
                            ref={createInputRef}
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCreateList()
                                }
                                if (e.key === 'Escape') {
                                    setCreating(false)
                                    setNewListName('')
                                }
                            }}
                            placeholder='List name…'
                            className='w-24 bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)]'
                        />
                        <button
                            onClick={() => {
                                setCreating(false)
                                setNewListName('')
                            }}
                            className='text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors'
                        >
                            <XIcon width={12} height={12} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setCreating(true)
                            setNewListName('')
                        }}
                        className='inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--line)] px-3 py-1 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors shrink-0'
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
                            ? `Browse another watchlist above or search across all lists`
                            : watchlists.length > 1
                              ? 'Switch to another list or add companies from the map or companies page'
                              : 'Start watching companies to track their job openings here'}
                    </p>
                    <div className='flex gap-3'>
                        <Link
                            href='/companies'
                            className='inline-flex items-center gap-2 px-4 py-2 bg-[var(--paper-3)] text-[var(--ink)] rounded-full border border-[var(--line)] text-[13px] font-medium no-underline transition-[border-color,background-color] duration-200 hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]'
                        >
                            Browse Companies
                        </Link>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
                    {(activeCategory ? activeFilteredCompanies : activeItems).map((entry: { name: string } | WatchlistItem) => {
                        const name = entry.name
                        const slug = generateCompanySlug(name)
                        const jobs = !activeCategory ? groupedJobs.get(name) || [] : []
                        const recent = hasRecentJobs(name, allJobs)
                        return (
                            <div
                                key={name}
                                className='group flex items-center justify-between gap-1 rounded-lg border border-[var(--line)] bg-[var(--paper-3)] px-3 py-2 hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] transition-colors'
                            >
                                <Link
                                    href={`/jobs/${slug}`}
                                    className='text-[12px] font-medium text-[var(--ink)] no-underline hover:text-blue-400 transition-colors truncate min-w-0'
                                >
                                    {name}
                                </Link>
                                <div className='flex items-center gap-1.5 shrink-0'>
                                    {recent && (
                                        <span className='inline-flex items-center gap-1 rounded-full bg-[var(--brand-tint)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--brand-deep)]'>
                                            New
                                        </span>
                                    )}
                                    {!activeCategory && jobs.length > 0 && (
                                        <span className='text-[10px] text-[var(--ink-mute)]'>{jobs.length}</span>
                                    )}
                                    <SaveCompanyButton name={name} slug={slug} variant='icon' />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

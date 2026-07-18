'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQueryState } from 'nuqs'
import clsx from 'clsx'
import { fuzzyMatch } from '@/utils/fuzzy-match'
import type { CompanyWithMetadata } from '@/types'
import { CompanyCard } from './CompanyCard'
import { SearchField } from './SearchField'
import { FilterChips } from './FilterChips'
import { EmptyStateNoResults } from './EmptyStateNoResults'
import { useSyncedSearchParam } from '@/hooks/use-synced-search-param'
import { XIcon, FilterIcon } from './icons'

const INITIAL_LIMIT = 100

const chipColors: Record<string, { color: string; bg: string; text: string }> = {
    remote: {
        color: 'var(--c-violet)',
        bg: 'bg-[color-mix(in_oklab,var(--c-violet)_15%,transparent)]',
        text: 'text-[var(--c-violet)]',
    },
    salary: {
        color: 'var(--c-amber)',
        bg: 'bg-[color-mix(in_oklab,var(--c-amber)_15%,transparent)]',
        text: 'text-[var(--c-amber)]',
    },
    fresh: {
        color: 'var(--c-blue)',
        bg: 'bg-[color-mix(in_oklab,var(--c-blue)_15%,transparent)]',
        text: 'text-[var(--c-blue)]',
    },
    loc: {
        color: 'var(--c-emerald)',
        bg: 'bg-[color-mix(in_oklab,var(--c-emerald)_15%,transparent)]',
        text: 'text-[var(--c-emerald)]',
    },
    dept: {
        color: 'var(--c-violet)',
        bg: 'bg-[color-mix(in_oklab,var(--c-violet)_15%,transparent)]',
        text: 'text-[var(--c-violet)]',
    },
    team: {
        color: 'var(--c-amber)',
        bg: 'bg-[color-mix(in_oklab,var(--c-amber)_15%,transparent)]',
        text: 'text-[var(--c-amber)]',
    },
}

interface CompaniesListProps {
    companies: CompanyWithMetadata[]
}

function PillInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className='relative'>
            <input
                type='text'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className='h-7 w-24 rounded-[var(--radius-pill)] border border-dotted border-[var(--line-strong)] bg-[var(--paper-3)] px-2.5 text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] transition-colors focus:border-[var(--brand)] focus:outline-none'
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className='absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)]'
                >
                    ×
                </button>
            )}
        </div>
    )
}

const pill = (active: boolean) =>
    clsx(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium transition-colors',
        active ? 'bg-[var(--violet-tint)] text-[var(--violet-deep)]' : 'bg-[var(--paper-3)] text-[var(--ink-soft)] hover:text-[var(--ink)]',
    )

function FilterModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12' onClick={onClose}>
            <div className='w-full max-w-sm rounded-xl bg-[var(--bg)] p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-base font-semibold text-[var(--ink)]'>Filters</h2>
                    <button
                        onClick={onClose}
                        className='grid size-7 place-items-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)]'
                    >
                        <XIcon width={16} height={16} />
                    </button>
                </div>
                <div className='space-y-5'>{children}</div>
            </div>
        </div>
    )
}

export function CompaniesList({ companies }: CompaniesListProps) {
    const [localSearchText, setLocalSearchText, debouncedSearchText, , setUrlSearchText] = useSyncedSearchParam('search')
    const [localLoc, setLocalLoc, debouncedLoc, urlLoc, setUrlLoc] = useSyncedSearchParam('loc', 'United States')
    const [localDept, setLocalDept, debouncedDept, urlDept, setUrlDept] = useSyncedSearchParam('dept')
    const [localTeam, setLocalTeam, debouncedTeam, urlTeam, setUrlTeam] = useSyncedSearchParam('team')

    // Pill filters
    const [remote, setRemote] = useQueryState('remote', { defaultValue: '', clearOnDefault: true })
    const [salary, setSalary] = useQueryState('salary', { defaultValue: '', clearOnDefault: true })
    const [fresh, setFresh] = useQueryState('fresh', { defaultValue: '', clearOnDefault: true })

    const [showFilterModal, setShowFilterModal] = useState(false)
    const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT)

    const [freshCutoff, setFreshCutoff] = useState(0)

    const handleFreshClick = (days: number) => {
        const next = fresh === String(days) ? '' : String(days)
        setFresh(next)
        setFreshCutoff(next ? Date.now() - days * 86400000 : 0)
    }

    const hasActiveFilters = !!(remote || salary || fresh || debouncedLoc || debouncedDept || debouncedTeam)

    const someFilterActive = !!(debouncedSearchText?.trim() || hasActiveFilters)

    const filteredCompanies = useMemo(() => {
        const filters: ((c: CompanyWithMetadata) => boolean)[] = []

        if (debouncedSearchText?.trim()) {
            const q = debouncedSearchText.toLowerCase()
            filters.push((c) => fuzzyMatch(c.name, q, 0.75))
        }
        if (remote) filters.push((c) => c.hasRemoteJobs)
        if (salary) filters.push((c) => c.hasSalary)
        if (freshCutoff > 0) {
            filters.push((c) => {
                if (!c.latestPostedAt) return false
                return new Date(c.latestPostedAt).getTime() >= freshCutoff
            })
        }
        if (debouncedLoc?.trim()) {
            const q = debouncedLoc.toLowerCase()
            filters.push((c) => c.locations.some((l) => l.toLowerCase().includes(q)))
        }
        if (debouncedDept?.trim()) {
            const q = debouncedDept.toLowerCase()
            filters.push((c) => c.departments.some((d) => d.toLowerCase().includes(q)))
        }
        if (debouncedTeam?.trim()) {
            const q = debouncedTeam.toLowerCase()
            filters.push((c) => c.teams.some((t) => t.toLowerCase().includes(q)))
        }

        return filters.length > 0 ? companies.filter((c) => filters.every((fn) => fn(c))) : companies
    }, [companies, debouncedSearchText, remote, salary, freshCutoff, debouncedLoc, debouncedDept, debouncedTeam])

    const displayCompanies = someFilterActive ? filteredCompanies : filteredCompanies.slice(0, visibleCount)

    const hasMore = !someFilterActive && visibleCount < filteredCompanies.length

    const activeFilterChips = useMemo(() => {
        const chips: {
            key: string
            label: string
            color: string
            bg: string
            text: string
            onRemove: () => void
        }[] = []
        if (remote)
            chips.push({
                key: 'remote',
                label: 'Remote',
                ...chipColors.remote,
                onRemove: () => setRemote(''),
            })
        if (salary)
            chips.push({
                key: 'salary',
                label: 'Salary',
                ...chipColors.salary,
                onRemove: () => setSalary(''),
            })
        if (fresh) {
            const label = fresh === '1' ? '24h' : fresh === '7' ? 'New' : '30d'
            chips.push({ key: 'fresh', label, ...chipColors.fresh, onRemove: () => setFresh('') })
        }
        if (urlLoc)
            chips.push({
                key: 'loc',
                label: urlLoc,
                ...chipColors.loc,
                onRemove: () => {
                    setLocalLoc('')
                    setUrlLoc(null)
                },
            })
        if (urlDept)
            chips.push({
                key: 'dept',
                label: urlDept,
                ...chipColors.dept,
                onRemove: () => {
                    setLocalDept('')
                    setUrlDept(null)
                },
            })
        if (urlTeam)
            chips.push({
                key: 'team',
                label: urlTeam,
                ...chipColors.team,
                onRemove: () => {
                    setLocalTeam('')
                    setUrlTeam(null)
                },
            })
        return chips
    }, [
        remote,
        salary,
        fresh,
        urlLoc,
        urlDept,
        urlTeam,
        setLocalLoc,
        setUrlLoc,
        setLocalDept,
        setUrlDept,
        setLocalTeam,
        setUrlTeam,
        setRemote,
        setSalary,
        setFresh,
    ])

    return (
        <div className='space-y-4'>
            <div className='flex items-stretch gap-2'>
                <SearchField value={localSearchText} onChange={setLocalSearchText} placeholder='Search companies…' className='flex-1' />
                <button
                    onClick={() => setShowFilterModal(true)}
                    className='inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border-2 border-dotted border-[var(--line-strong)] bg-[var(--paper-3)] px-4 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]'
                >
                    <FilterIcon className='size-4' />
                </button>
            </div>

            <FilterChips chips={activeFilterChips} />

            {/* Results info */}
            {(someFilterActive || (!someFilterActive && filteredCompanies.length > INITIAL_LIMIT)) && filteredCompanies.length > 0 && (
                <div className='text-[13px] text-[var(--ink-mute)]'>
                    {someFilterActive ? (
                        <span>
                            {filteredCompanies.length.toLocaleString()} compan
                            {filteredCompanies.length === 1 ? 'y' : 'ies'}
                        </span>
                    ) : (
                        <span>
                            Showing {Math.min(visibleCount, filteredCompanies.length).toLocaleString()} of{' '}
                            {filteredCompanies.length.toLocaleString()} companies
                        </span>
                    )}
                </div>
            )}

            {/* Companies grid */}
            {displayCompanies.length === 0 ? (
                <EmptyStateNoResults title='No companies found' subtitle='Try adjusting your search' />
            ) : (
                <div className='overflow-hidden'>
                    <div className='-mb-px -mr-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                        {displayCompanies.map(({ name, jobCount, hasNewJobs }) => (
                            <CompanyCard key={name} name={name} jobCount={jobCount} hasNewJobs={hasNewJobs} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className='flex justify-center py-6'>
                            <button
                                onClick={() => setVisibleCount(filteredCompanies.length)}
                                className='cursor-pointer rounded-[var(--radius-pill)] border border-dotted border-[var(--line-strong)] px-5 py-2 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:border-[var(--ink-soft)] hover:text-[var(--ink)]'
                            >
                                Show more
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Filter modal */}
            <FilterModal open={showFilterModal} onClose={() => setShowFilterModal(false)}>
                <SearchField value={localSearchText} onChange={setLocalSearchText} placeholder='Search companies…' />

                <div className='space-y-3'>
                    <div className='text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]'>Availability</div>
                    <div className='flex flex-wrap gap-2'>
                        <button onClick={() => setRemote(remote ? '' : '1')} className={pill(!!remote)}>
                            Remote
                        </button>
                        <button onClick={() => setSalary(salary ? '' : '1')} className={pill(!!salary)}>
                            Salary
                        </button>
                        <button onClick={() => handleFreshClick(7)} className={pill(fresh === '7')}>
                            New
                        </button>
                        <button onClick={() => handleFreshClick(1)} className={pill(fresh === '1')}>
                            24h
                        </button>
                        <button onClick={() => handleFreshClick(30)} className={pill(fresh === '30')}>
                            30d
                        </button>
                    </div>
                </div>

                <div className='space-y-3'>
                    <div className='text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]'>Details</div>
                    <div className='space-y-2'>
                        <div>
                            <label className='mb-1 block text-[12px] text-[var(--ink-soft)]'>Location</label>
                            <div className='max-w-xs'>
                                <PillInput value={localLoc} onChange={setLocalLoc} placeholder='Location…' />
                            </div>
                        </div>
                        <div>
                            <label className='mb-1 block text-[12px] text-[var(--ink-soft)]'>Department</label>
                            <div className='max-w-xs'>
                                <PillInput value={localDept} onChange={setLocalDept} placeholder='Dept…' />
                            </div>
                        </div>
                        <div>
                            <label className='mb-1 block text-[12px] text-[var(--ink-soft)]'>Team</label>
                            <div className='max-w-xs'>
                                <PillInput value={localTeam} onChange={setLocalTeam} placeholder='Team…' />
                            </div>
                        </div>
                    </div>
                </div>

                {(hasActiveFilters || debouncedSearchText?.trim()) && (
                    <button
                        onClick={() => {
                            setRemote('')
                            setSalary('')
                            setFresh('')
                            setFreshCutoff(0)
                            setLocalLoc('')
                            setLocalDept('')
                            setLocalTeam('')
                            setLocalSearchText('')
                            setUrlSearchText(null)
                            setUrlLoc(null)
                            setUrlDept(null)
                            setUrlTeam(null)
                        }}
                        className='w-full rounded-[var(--radius-pill)] border border-dotted border-[var(--line-strong)] px-3 py-2 text-[12px] font-medium text-[var(--ink-mute)] transition-colors hover:border-[var(--ink-soft)] hover:text-[var(--ink)]'
                    >
                        Clear all filters
                    </button>
                )}
            </FilterModal>
        </div>
    )
}

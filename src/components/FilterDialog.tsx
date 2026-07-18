'use client'

import { useState, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import type { JobMarker } from '@/types'
import { getJobDate } from '@/utils/format'
import { SearchField } from './SearchField'
import { ExperienceLevel } from '@/types'
import { Checkmark, XIcon, MinusIcon } from './icons'
import { isRemoteJob } from '@/utils/search'
import { matchesExperienceLevel } from '@/utils/search'
import { getSalaryValue } from '@/utils/format'

export interface FilterState {
    companies: string[]
    excludeCompanies: string[]
    locations: string[]
    searchText: string
    postedWithin: number | null
    remoteOnly: boolean
    minSalary: number | null
    experience: ExperienceLevel | null
    watchlistOnly: boolean
}

export const EMPTY_FILTERS: FilterState = {
    companies: [],
    excludeCompanies: [],
    locations: [],
    searchText: '',
    postedWithin: null,
    remoteOnly: false,
    minSalary: null,
    experience: null,
    watchlistOnly: false,
}

const DAY_MS = 24 * 60 * 60 * 1000

function matchesFilters(job: JobMarker, f: FilterState): boolean {
    if (f.companies.length > 0 && !f.companies.includes(job.company)) return false
    if (f.excludeCompanies?.length > 0 && f.excludeCompanies.includes(job.company)) return false
    if (f.locations.length > 0 && !f.locations.includes(job.location)) return false
    if (f.searchText.trim()) {
        const terms = f.searchText.toLowerCase().split(/\s+/).filter(Boolean)
        const title = job.title.toLowerCase()
        const company = job.company.toLowerCase()
        const location = job.location.toLowerCase()
        const ok = terms.every((t) => title.includes(t) || company.includes(t) || location.includes(t))
        if (!ok) return false
    }

    if (f.postedWithin != null) {
        const d = getJobDate(job)
        if (!d || d.getTime() < Date.now() - f.postedWithin * DAY_MS) return false
    }

    if (f.remoteOnly && !isRemoteJob(job)) return false
    if (f.minSalary != null && getSalaryValue(job.salary_summary) < f.minSalary) return false
    if (f.experience && !matchesExperienceLevel(job, f.experience)) return false

    return true
}

function countMatches(jobs: JobMarker[], f: FilterState): number {
    let n = 0
    for (const job of jobs) if (matchesFilters(job, f)) n++
    return n
}

export function countActiveFilters(f: FilterState): number {
    return (
        f.companies.length +
        (f.excludeCompanies?.length || 0) +
        f.locations.length +
        (f.searchText.trim() ? 1 : 0) +
        (f.postedWithin != null ? 1 : 0) +
        (f.remoteOnly ? 1 : 0) +
        (f.minSalary != null ? 1 : 0) +
        (f.experience ? 1 : 0) +
        (f.watchlistOnly ? 1 : 0)
    )
}

type SortOption = 'location' | 'title' | 'company' | 'recent' | 'experience' | 'salary'

interface FilterDialogProps {
    isOpen: boolean
    onClose: () => void
    jobs: JobMarker[]
    onApplyFilters: (filters: FilterState) => void
    /** Currently-applied filters — the dialog syncs to these when it opens. */
    current: FilterState
    sortBy: SortOption
    onSortChange: (value: SortOption) => void
}

const pill = (active: boolean) =>
    clsx(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium transition-colors',
        active ? 'bg-[var(--violet-tint)] text-[var(--violet-deep)]' : 'bg-[var(--paper-3)] text-[var(--ink-soft)] hover:text-[var(--ink)]',
    )

const labelCls = 'block text-[11px] font-medium uppercase tracking-wide text-[var(--ink-mute)] mb-2'

const SALARY_TIERS: { label: string; value: number | null }[] = [
    { label: 'Any', value: null },
    { label: 'Has salary', value: 1 },
    { label: '$100k+', value: 100000 },
    { label: '$150k+', value: 150000 },
    { label: '$200k+', value: 200000 },
    { label: '$300k+', value: 300000 },
]

const EXPERIENCE_LEVELS: { label: string; value: ExperienceLevel | null }[] = [
    { label: 'Any', value: null },
    { label: 'Entry', value: 'entry' },
    { label: 'Mid', value: 'mid' },
    { label: 'Senior', value: 'senior' },
]

const POSTED_OPTIONS: { label: string; value: number | null }[] = [
    { label: 'Any time', value: null },
    { label: '24h', value: 1 },
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
]

function CheckIcon() {
    return <Checkmark strokeWidth={3} className='size-3' />
}

export function FilterDialog({ isOpen, onClose, jobs, onApplyFilters, current, sortBy, onSortChange }: FilterDialogProps) {
    const [filters, setFilters] = useState<FilterState>(() => current)
    const [companySearchText, setCompanySearchText] = useState('')
    const [locationSearchText, setLocationSearchText] = useState('')

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const companies = useMemo(() => {
        const c = new Set<string>()
        jobs.forEach((job) => {
            const company = job.company?.trim()
            if (company) c.add(company)
        })
        return Array.from(c).sort()
    }, [jobs])

    const filteredCompanies = useMemo(() => {
        if (!companySearchText) return companies
        const q = companySearchText.toLowerCase()
        return companies.filter((c) => c.toLowerCase().includes(q))
    }, [companies, companySearchText])

    const locations = useMemo(() => {
        const l = new Set<string>()
        jobs.forEach((job) => {
            const loc = job.location?.trim()
            if (loc) l.add(loc)
        })
        return Array.from(l).sort()
    }, [jobs])

    const filteredLocations = useMemo(() => {
        if (!locationSearchText) return locations
        const q = locationSearchText.toLowerCase()
        return locations.filter((l) => l.toLowerCase().includes(q))
    }, [locations, locationSearchText])

    const matchCount = useMemo(() => countMatches(jobs, filters), [jobs, filters])
    const activeCount = countActiveFilters(filters)

    // Companies cycle through three states: off → include → exclude → off.
    const cycleCompany = (value: string) => {
        setFilters((f) => {
            const inc = new Set(f.companies)
            const exc = new Set(f.excludeCompanies)
            if (inc.has(value)) {
                inc.delete(value)
                exc.add(value)
            } else if (exc.has(value)) {
                exc.delete(value)
            } else {
                inc.add(value)
            }
            return { ...f, companies: Array.from(inc), excludeCompanies: Array.from(exc) }
        })
    }

    const cycleLocation = (value: string) => {
        setFilters((f) => {
            const locs = new Set(f.locations)
            if (locs.has(value)) locs.delete(value)
            else locs.add(value)
            return { ...f, locations: Array.from(locs) }
        })
    }

    const handleApply = () => {
        onApplyFilters(filters)
        onClose()
    }

    const handleReset = () => {
        setFilters(EMPTY_FILTERS)
        setCompanySearchText('')
        setLocationSearchText('')
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5 sm:p-6' onClick={onClose}>
            <div
                className='flex max-h-[86vh] w-full max-w-[860px] flex-col rounded-2xl bg-[var(--paper-2)] text-[var(--ink)] shadow-[0_24px_64px_rgba(0,0,0,0.6)]'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4'>
                    <div className='flex items-center gap-2'>
                        <h2 className='lab-header m-0 text-[16px] font-normal tracking-tight'>Filter jobs</h2>
                        {activeCount > 0 && (
                            <span className='rounded-[var(--radius-pill)] bg-[var(--violet-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--violet-deep)]'>
                                {activeCount} active
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className='grid size-7 place-items-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)]'
                        aria-label='Close'
                    >
                        <XIcon className='size-4' />
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 space-y-5 overflow-y-auto p-5'>
                    {/* Keyword search */}
                    <div>
                        <label className={labelCls}>Search by keyword</label>
                        <SearchField
                            value={filters.searchText}
                            onChange={(v) => setFilters((f) => ({ ...f, searchText: v }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApply()
                            }}
                            placeholder='Title, company, location…'
                        />
                    </div>

                    {/* Quick filters */}
                    <div>
                        <label className={labelCls}>Quick filters</label>
                        <div className='flex flex-wrap gap-2'>
                            <button
                                onClick={() =>
                                    setFilters((f) => ({
                                        ...f,
                                        postedWithin: f.postedWithin === 7 ? null : 7,
                                    }))
                                }
                                className={pill(filters.postedWithin === 7)}
                            >
                                ✦ New
                            </button>
                            <button
                                onClick={() => setFilters((f) => ({ ...f, remoteOnly: !f.remoteOnly }))}
                                className={pill(filters.remoteOnly)}
                            >
                                Remote
                            </button>
                            <button
                                onClick={() =>
                                    setFilters((f) => ({
                                        ...f,
                                        minSalary: f.minSalary != null ? null : 1,
                                    }))
                                }
                                className={pill(filters.minSalary != null)}
                            >
                                Has salary
                            </button>
                            <button
                                onClick={() => setFilters((f) => ({ ...f, watchlistOnly: !f.watchlistOnly }))}
                                className={pill(filters.watchlistOnly)}
                            >
                                ☆ Watchlist
                            </button>
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className={labelCls}>Sort by</label>
                        <div className='flex flex-wrap gap-2'>
                            {[
                                { value: 'recent', label: 'Recent' },
                                { value: 'salary', label: 'Salary' },
                                { value: 'experience', label: 'Experience' },
                                { value: 'company', label: 'Company' },
                                { value: 'title', label: 'Title' },
                                { value: 'location', label: 'Location' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onSortChange(option.value as SortOption)}
                                    className={pill(sortBy === option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Segmented controls (click an active one to clear it) */}
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                        <div>
                            <label className={labelCls}>Posted within</label>
                            <div className='flex flex-wrap gap-2'>
                                {POSTED_OPTIONS.map((o) => (
                                    <button
                                        key={o.label}
                                        onClick={() =>
                                            setFilters((f) => ({
                                                ...f,
                                                postedWithin: f.postedWithin === o.value ? null : o.value,
                                            }))
                                        }
                                        className={pill(filters.postedWithin === o.value)}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Experience</label>
                            <div className='flex flex-wrap gap-2'>
                                {EXPERIENCE_LEVELS.map((o) => (
                                    <button
                                        key={o.label}
                                        onClick={() =>
                                            setFilters((f) => ({
                                                ...f,
                                                experience: f.experience === o.value ? null : o.value,
                                            }))
                                        }
                                        className={pill(filters.experience === o.value)}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className='sm:col-span-2'>
                            <label className={labelCls}>Salary</label>
                            <div className='flex flex-wrap gap-2'>
                                {SALARY_TIERS.map((o) => (
                                    <button
                                        key={o.label}
                                        onClick={() =>
                                            setFilters((f) => ({
                                                ...f,
                                                minSalary: f.minSalary === o.value ? null : o.value,
                                            }))
                                        }
                                        className={pill(filters.minSalary === o.value)}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Companies — click once to include, again to exclude, again to clear */}
                    <SelectList
                        title='Companies'
                        placeholder='Search companies…'
                        items={filteredCompanies}
                        included={filters.companies}
                        excluded={filters.excludeCompanies}
                        searchText={companySearchText}
                        onSearchChange={setCompanySearchText}
                        onCycle={cycleCompany}
                        onClear={() => setFilters((f) => ({ ...f, companies: [], excludeCompanies: [] }))}
                        uppercase
                    />

                    {/* Locations — click to toggle include/clear */}
                    <SelectList
                        title='Locations'
                        placeholder='Search locations…'
                        items={filteredLocations}
                        included={filters.locations}
                        excluded={[]}
                        searchText={locationSearchText}
                        onSearchChange={setLocationSearchText}
                        onCycle={cycleLocation}
                        onClear={() => setFilters((f) => ({ ...f, locations: [] }))}
                    />
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between gap-4 px-5 py-4'>
                    <button
                        onClick={handleReset}
                        disabled={activeCount === 0}
                        className='text-[13px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40'
                    >
                        Reset all
                    </button>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={onClose}
                            className='rounded-[var(--radius-pill)] bg-[var(--paper-3)] px-4 py-1.5 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className='rounded-[var(--radius-pill)] bg-[var(--violet-solid)] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--violet-solid-hover)]'
                        >
                            Show {matchCount.toLocaleString()} {matchCount === 1 ? 'job' : 'jobs'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MinusCheckIcon() {
    return <MinusIcon strokeWidth={3} className='size-3' />
}

function SelectList({
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
}: {
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
}) {
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

            {/* Selected chips — included then excluded */}
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
                        // Merge consecutive same-state rows into one smooth block: a selected
                        // run only rounds at its top and bottom.
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

'use client'

import { useState, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import type { JobMarker } from '@/types'
import { getJobDate } from '@/utils/format'
import { SelectList } from './SelectList'
import { SearchField } from './SearchField'
import { ExperienceLevel } from '@/types'
import { XIcon } from './icons'
import { isRemoteJob } from '@/utils/job-filters'
import { matchesExperienceLevel } from '@/utils/job-filters'
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
        'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium transition-colors',
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
                            <span className='rounded-md bg-[var(--violet-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--violet-deep)]'>
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
                            className='rounded-md bg-[var(--paper-3)] px-4 py-1.5 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className='rounded-md bg-[var(--violet-solid)] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--violet-solid-hover)]'
                        >
                            Show {matchCount.toLocaleString()} {matchCount === 1 ? 'job' : 'jobs'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}



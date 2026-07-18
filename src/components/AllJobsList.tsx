'use client'

import { useState, useMemo, useEffect, useTransition, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useQueryState, parseAsInteger, parseAsString, parseAsBoolean, parseAsArrayOf } from 'nuqs'
import clsx from 'clsx'
import { formatExperience, formatSalary } from '@/utils/format'
import { formatJobDate } from '@/utils/format'
import { SaveJobButton } from '@/components/SaveJobButton'
import { AppliedJobButton } from '@/components/AppliedJobButton'
import { addUtmParams } from '@/utils/format'
import { getCountry } from '@/utils/format'
import { fuzzyMatch } from '@/utils/search'
import { SearchField } from './SearchField'
import { FilterDialog, type FilterState } from './FilterDialog'
import { FilterChips } from './FilterChips'
import { useSavedCompanies } from '@/hooks/use-saved-companies'
import type { JobMarker } from '@/types'
import { ExperienceLevel } from '@/types'
import { isRemoteJob } from '@/utils/search'
import { matchesExperienceLevel } from '@/utils/search'
import { getSalaryValue } from '@/utils/format'
import { EmptyStateNoResults } from './EmptyStateNoResults'
import { useSyncedSearchParam } from '@/hooks/use-synced-search-param'
import { FilterIcon, MapPinIcon, ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon } from './icons'

type Job = JobMarker

const PAGE_SIZE = 50

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

type SortOption = 'location' | 'title' | 'company' | 'recent' | 'experience' | 'salary'

const chipColors: Record<string, { color: string; bg: string; text: string }> = {
    loc: {
        color: 'var(--c-blue)',
        bg: 'bg-[color-mix(in_oklab,var(--c-blue)_15%,transparent)]',
        text: 'text-[var(--c-blue)]',
    },
    inc: {
        color: 'var(--c-emerald)',
        bg: 'bg-[color-mix(in_oklab,var(--c-emerald)_15%,transparent)]',
        text: 'text-[var(--c-emerald)]',
    },
    exc: {
        color: '#ef4444',
        bg: 'bg-[color-mix(in_oklab,#ef4444_15%,transparent)]',
        text: 'text-[#ef4444]',
    },
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
    exp: {
        color: 'var(--c-violet)',
        bg: 'bg-[color-mix(in_oklab,var(--c-violet)_15%,transparent)]',
        text: 'text-[var(--c-violet)]',
    },
    watchlist: {
        color: 'var(--c-amber)',
        bg: 'bg-[color-mix(in_oklab,var(--c-amber)_15%,transparent)]',
        text: 'text-[var(--c-amber)]',
    },
}

interface AllJobsListProps {
    jobs: Job[]
    hideCompanyName?: boolean
}

interface JobWithTimestamp extends Job {
    _dateTimestamp: number | null
}

function normalizeForSearch(str: string): string {
    return str.trim().toLowerCase()
}

function normalizeForCompare(str: string): string {
    return str.trim()
}

function compareStrings(a: string, b: string): number {
    return normalizeForCompare(a).localeCompare(normalizeForCompare(b), undefined, {
        sensitivity: 'base',
    })
}

function getExperienceValue(experience: string | null | undefined): number {
    if (!experience) return Infinity // Jobs without experience go to the end
    const numberMatch = experience.match(/\d+/)
    return numberMatch ? parseInt(numberMatch[0], 10) : Infinity
}

interface ParsedSearch {
    age: number | null
    company: string | null
    location: string | null
    generalSearch: string
}

function parseSearchText(searchText: string): ParsedSearch {
    if (!searchText?.trim()) {
        return { age: null, company: null, location: null, generalSearch: '' }
    }

    let remainingText = searchText
    let age: number | null = null
    let company: string | null = null
    let location: string | null = null

    const ageMatch = remainingText.match(/@age:(\d+)/i)
    if (ageMatch) {
        age = parseInt(ageMatch[1], 10)
        remainingText = remainingText.replace(/@age:\d+/gi, '').trim()
    }

    const companyMatch = remainingText.match(/@company:([^@]+?)(?=\s*@|\s*$)/i)
    if (companyMatch) {
        company = companyMatch[1].trim()
        remainingText = remainingText.replace(/@company:[^@]+?(?=\s*@|\s*$)/gi, '').trim()
    }

    const locationMatch = remainingText.match(/@location:([^@]+?)(?=\s*@|\s*$)/i)
    if (locationMatch) {
        location = locationMatch[1].trim()
        remainingText = remainingText.replace(/@location:[^@]+?(?=\s*@|\s*$)/gi, '').trim()
    }

    return {
        age,
        company: company || null,
        location: location || null,
        generalSearch: remainingText,
    }
}

export function AllJobsList({ jobs, hideCompanyName = false }: AllJobsListProps) {
    const [ageFilter, setAgeFilter] = useQueryState('age', parseAsInteger.withDefault(null as unknown as number))
    const [localSearchText, setLocalSearchText, debouncedSearchText] = useSyncedSearchParam('search')
    const [sortBy, setSortBy] = useState<SortOption>('recent')
    const [isPending, startTransition] = useTransition()
    const [now] = useState(Date.now)
    const [filterOpen, setFilterOpen] = useState(false)
    const [companies, setCompanies] = useQueryState('companies', parseAsArrayOf(parseAsString).withDefault([]))
    const [excludeCompanies, setExcludeCompanies] = useQueryState('exclude', parseAsArrayOf(parseAsString).withDefault([]))
    const [remoteOnly, setRemoteOnly] = useQueryState('remote', parseAsBoolean.withDefault(false))
    const [minSalary, setMinSalary] = useQueryState('minSalary', parseAsInteger)
    const [experience, setExperience] = useQueryState('exp', parseAsString)
    const [locations, setLocations] = useQueryState('locations', parseAsArrayOf(parseAsString).withDefault([]))
    const [watchlistOnly, setWatchlistOnly] = useQueryState('watchlist', parseAsBoolean.withDefault(false))
    const { savedCompanyNames } = useSavedCompanies()
    const defaultLocationsSet = useRef(false)
    useEffect(() => {
        if (!defaultLocationsSet.current && locations.length === 0) {
            defaultLocationsSet.current = true
            setLocations(['United States'])
        }
    }, [locations, setLocations])
    const extra = useMemo(
        () => ({
            companies,
            excludeCompanies,
            locations,
            remoteOnly,
            minSalary,
            experience: (experience as ExperienceLevel | null) ?? null,
            watchlistOnly,
        }),
        [companies, excludeCompanies, locations, remoteOnly, minSalary, experience, watchlistOnly],
    )

    const cycleCompany = (name: string) => {
        const inc = new Set(companies)
        const exc = new Set(excludeCompanies)
        if (inc.has(name)) {
            inc.delete(name)
            exc.add(name)
        } else if (exc.has(name)) {
            exc.delete(name)
        } else {
            inc.add(name)
        }
        setCompanies(Array.from(inc))
        setExcludeCompanies(Array.from(exc))
    }

	const handleSearchKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter') return
            const text = localSearchText
            const parsed = parseSearchText(text)
            let newSearch = text

            if (parsed.company) {
                setCompanies((prev: string[]) => (prev.includes(parsed.company!) ? prev : [...prev, parsed.company!]))
                newSearch = newSearch.replace(/@company:[^@]+?(?=\s*@|\s*$)/gi, '').trim()
            }

            if (parsed.location) {
                setLocations((prev: string[]) => (prev.includes(parsed.location!) ? prev : [...prev, parsed.location!]))
                newSearch = newSearch.replace(/@location:[^@]+?(?=\s*@|\s*$)/gi, '').trim()
            }

            if (parsed.age !== null) {
                startTransition(() => {
                    setAgeFilter(parsed.age)
                })
                newSearch = newSearch.replace(/@age:\d+/gi, '').trim()
            }

            if (newSearch !== text) {
                setLocalSearchText(newSearch)
            }
        },
        [localSearchText, setCompanies, setLocations, setAgeFilter, startTransition],
    )

    const hasJobs = jobs.length > 0

    const jobsWithTimestamps = useMemo(() => {
        return jobs.map((job): JobWithTimestamp => {
            let timestamp: number | null = null
            if (job.posted_at) {
                try {
                    const date = new Date(job.posted_at)
                    const timeValue = date.getTime()
                    timestamp = isNaN(timeValue) ? null : timeValue
                } catch {
                    timestamp = null
                }
            }
            return { ...job, _dateTimestamp: timestamp }
        })
    }, [jobs])

    const parsedSearch = useMemo(() => parseSearchText(debouncedSearchText || ''), [debouncedSearchText])
    useEffect(() => {
        if (parsedSearch.age !== null && parsedSearch.age !== ageFilter) {
            startTransition(() => {
                setAgeFilter(parsedSearch.age)
            })
        }
    }, [parsedSearch.age, ageFilter, setAgeFilter])

    const processedJobs = useMemo(() => {
        let filtered: JobWithTimestamp[] = jobsWithTimestamps
        const effectiveAge = parsedSearch.age !== null ? parsedSearch.age : ageFilter

		if (effectiveAge !== null) {
            const cutoff = now - effectiveAge * 24 * 60 * 60 * 1000
            filtered = filtered.filter((job) => {
                const timestamp = job._dateTimestamp
                if (timestamp === null) return false
                return timestamp >= cutoff && timestamp <= now
            })
        }

        if (parsedSearch.company) {
            filtered = filtered.filter((job) => fuzzyMatch(job.company, parsedSearch.company!, 0.95))
        }

        if (parsedSearch.location) {
            const locationLower = normalizeForSearch(parsedSearch.location)
            filtered = filtered.filter((job) => normalizeForSearch(job.location).includes(locationLower))
        }

        if (parsedSearch.generalSearch?.trim()) {
            const generalSearchLower = normalizeForSearch(parsedSearch.generalSearch)
            const searchTerms = generalSearchLower.split(/\s+/).filter((term) => term.length > 0)

            filtered = filtered.filter((job) => {
                const titleLower = normalizeForSearch(job.title)
                const locationLower = normalizeForSearch(job.location)

                return searchTerms.every((term) => {
                    if (titleLower.includes(term) || locationLower.includes(term)) {
                        return true
                    }
                    return fuzzyMatch(job.company, term, 0.75)
                })
            })
        }

        if (extra.companies.length > 0) {
            filtered = filtered.filter((job) => extra.companies.includes(job.company))
        }
        if (extra.excludeCompanies.length > 0) {
            filtered = filtered.filter((job) => !extra.excludeCompanies.includes(job.company))
        }
        if (extra.locations.length > 0) {
            filtered = filtered.filter((job) => extra.locations.includes(job.location))
        }
        if (extra.remoteOnly) {
            filtered = filtered.filter((job) => isRemoteJob(job))
        }
        if (extra.minSalary != null) {
            filtered = filtered.filter((job) => getSalaryValue(job.salary_summary) >= extra.minSalary!)
        }
        if (extra.experience) {
            filtered = filtered.filter((job) => matchesExperienceLevel(job, extra.experience!))
        }

        if (extra.watchlistOnly && savedCompanyNames.length > 0) {
            filtered = filtered.filter((job) => savedCompanyNames.includes(job.company))
        }

        const sorted = [...filtered]
        switch (sortBy) {
            case 'location':
                sorted.sort((a, b) => compareStrings(a.location, b.location))
                break
            case 'company':
                sorted.sort((a, b) => compareStrings(a.company, b.company))
                break
            case 'recent':
                sorted.sort((a, b) => {
                    const timestampA = a._dateTimestamp
                    const timestampB = b._dateTimestamp
                    if (timestampA === null && timestampB === null) return 0
                    if (timestampA === null) return 1
                    if (timestampB === null) return -1
                    return timestampB - timestampA // Newest first
                })
                break
            case 'experience':
                sorted.sort((a, b) => {
                    const expA = getExperienceValue(a.experience)
                    const expB = getExperienceValue(b.experience)
                    return expA - expB // Lower experience first (entry level first)
                })
                break
            case 'salary':
                sorted.sort((a, b) => {
                    const salaryA = getSalaryValue(a.salary_summary)
                    const salaryB = getSalaryValue(b.salary_summary)
                    return salaryB - salaryA // Higher salary first
                })
                break
            case 'title':
            default:
                sorted.sort((a, b) => compareStrings(a.title, b.title))
                break
        }

        return sorted
    }, [jobsWithTimestamps, parsedSearch, sortBy, ageFilter, extra, savedCompanyNames, now])

    // Pagination — slice the filtered/sorted set (no nested scroll container).
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
    const totalPages = Math.max(1, Math.ceil(processedJobs.length / PAGE_SIZE))
    const currentPage = Math.min(Math.max(1, page ?? 1), totalPages)
    const pageJobs = processedJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const topRef = useRef<HTMLDivElement>(null)

    // Reset to page 1 when the result set changes (search / sort / filters).
    const didMountRef = useRef(false)
    useEffect(() => {
        if (didMountRef.current) {
            startTransition(() => {
                setPage(1)
            })
        } else {
            didMountRef.current = true
        }
    }, [debouncedSearchText, sortBy, ageFilter, extra, setPage])

    const goToPage = (p: number) => {
        const next = Math.min(Math.max(1, p), totalPages)
        startTransition(() => {
            setPage(next)
        })
        topRef.current?.scrollIntoView({ block: 'start' })
    }

    const handleSortChange = (value: SortOption) => {
        startTransition(() => {
            setSortBy(value)
        })
    }

    const currentFilters: FilterState = {
        companies: extra.companies,
        excludeCompanies: extra.excludeCompanies,
        locations: extra.locations,
        searchText: localSearchText,
        postedWithin: ageFilter ?? null,
        remoteOnly: extra.remoteOnly,
        minSalary: extra.minSalary,
        experience: extra.experience,
        watchlistOnly: extra.watchlistOnly,
    }

    const activeFilterChips = useMemo(() => {
        const chips: {
            key: string
            label: string
            color: string
            bg: string
            text: string
            onRemove: () => void
        }[] = []

        for (const loc of extra.locations) {
            chips.push({
                key: `loc-${loc}`,
                label: `📍 ${loc}`,
                ...chipColors.loc,
                onRemove: () => setLocations((prev: string[]) => prev.filter((l) => l !== loc)),
            })
        }

        for (const company of extra.companies) {
            chips.push({
                key: `inc-${company}`,
                label: company,
                ...chipColors.inc,
                onRemove: () => setCompanies((prev: string[]) => prev.filter((c) => c !== company)),
            })
        }

        for (const company of extra.excludeCompanies) {
            chips.push({
                key: `exc-${company}`,
                label: `-${company}`,
                ...chipColors.exc,
                onRemove: () => setExcludeCompanies((prev: string[]) => prev.filter((c) => c !== company)),
            })
        }

        if (extra.remoteOnly) {
            chips.push({
                key: 'remote',
                label: 'Remote only',
                ...chipColors.remote,
                onRemove: () => setRemoteOnly(false),
            })
        }

        if (extra.minSalary != null) {
            const label = extra.minSalary === 1 ? 'Has salary' : `$${Math.round(extra.minSalary / 1000)}k+`
            chips.push({
                key: 'salary',
                label,
                ...chipColors.salary,
                onRemove: () => setMinSalary(null),
            })
        }

        if (extra.experience) {
            chips.push({
                key: 'exp',
                label: extra.experience.charAt(0).toUpperCase() + extra.experience.slice(1),
                ...chipColors.exp,
                onRemove: () => setExperience(null),
            })
        }

        if (extra.watchlistOnly) {
            chips.push({
                key: 'watchlist',
                label: '☆ Watchlist',
                ...chipColors.watchlist,
                onRemove: () => setWatchlistOnly(false),
            })
        }

        return chips
    }, [extra, setCompanies, setExcludeCompanies, setLocations, setRemoteOnly, setMinSalary, setExperience, setWatchlistOnly])

    const extraActiveCount =
        extra.companies.length +
        extra.excludeCompanies.length +
        extra.locations.length +
        (extra.remoteOnly ? 1 : 0) +
        (extra.minSalary != null ? 1 : 0) +
        (extra.experience ? 1 : 0) +
        (extra.watchlistOnly ? 1 : 0)

    const handleApplyFilters = (f: FilterState) => {
        setCompanies(f.companies)
        setExcludeCompanies(f.excludeCompanies)
        setLocations(f.locations)
        setRemoteOnly(f.remoteOnly)
        setMinSalary(f.minSalary)
        setExperience(f.experience ?? null)
        setWatchlistOnly(f.watchlistOnly)
        if (f.searchText !== localSearchText) setLocalSearchText(f.searchText)
        if (f.postedWithin !== ageFilter) {
            startTransition(() => {
                setAgeFilter(f.postedWithin)
            })
        }
    }

    return (
        <div className='space-y-4'>
            {/* Search + controls */}
            <div className='space-y-3'>
                <div className='flex items-stretch gap-2'>
                    <SearchField
                        value={localSearchText}
                        onChange={setLocalSearchText}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={hasJobs ? 'Search jobs (@company:Deepmind @location:SF engineer)' : 'No roles yet'}
                        disabled={!hasJobs}
                        className='flex-1'
                    />
                    <button
                        type='button'
                        onClick={() => setFilterOpen(true)}
                        disabled={!hasJobs}
                        className='inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border-2 border-dotted border-[var(--line-strong)] bg-[var(--paper-3)] px-4 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        <FilterIcon className='size-4' aria-hidden />
                        {extraActiveCount > 0 && (
                            <span className='rounded-[var(--radius-pill)] bg-[var(--violet-tint)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--violet-deep)]'>
                                {extraActiveCount}
                            </span>
                        )}
                    </button>
                </div>

                <FilterChips chips={activeFilterChips} />
            </div>

            {/* Results info */}
            {processedJobs.length > 0 && (
                <div className='text-[13px] text-[var(--ink-mute)]'>
                    <span>
                        Showing {pageJobs.length.toLocaleString()} of {processedJobs.length.toLocaleString()} job
                        {processedJobs.length === 1 ? '' : 's'}
                    </span>
                </div>
            )}

            {/* Job list — single column, paginated (no nested scroll) */}
            <div ref={topRef} className='scroll-mt-4 overflow-hidden rounded-xl'>
                {isPending ? (
                    <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
                        <div className='mb-4 size-7 animate-spin rounded-full border-2 border-[var(--line-strong)] border-t-[var(--violet)]' />
                        <p className='m-0 text-[14px] font-medium text-[var(--ink-soft)]'>Loading jobs…</p>
                    </div>
                ) : processedJobs.length === 0 ? (
                    <EmptyStateNoResults title='No jobs found' subtitle='Try adjusting your search or filters' />
                ) : (
                    pageJobs.map((job, i) => {
                        const uniqueKey = `${job.ats_id || job.id || 'unknown'}-${(currentPage - 1) * PAGE_SIZE + i}`
                        const formattedDate = formatJobDate(job)
                        const salary = formatSalary(job)
                        const experience = formatExperience(job.experience)
                        const compIncluded = companies.includes(job.company)
                        const compExcluded = excludeCompanies.includes(job.company)

                        return (
                            <div
                                key={uniqueKey}
                                className='group flex items-center justify-between gap-3 border-b border-dotted border-[var(--line-strong)] px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]'
                            >
                                <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2'>
                                        <a
                                            href={addUtmParams(job.url)}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='truncate text-[15px] font-medium leading-tight text-[var(--ink)] no-underline transition-colors group-hover:text-[var(--violet-deep)]'
                                        >
                                            {job.title}
                                        </a>
                                        {experience && <span className='shrink-0 text-[11px] text-[var(--ink-mute)]'>{experience}</span>}
                                    </div>
                                    <div className='mt-0.5 flex min-w-0 items-center gap-1.5 text-[12.5px] text-[var(--ink-mute)]'>
                                        {!hideCompanyName && (
                                            <span className='contents max-sm:hidden'>
                                                <Link
                                                    href={`/jobs?companies=${encodeURIComponent(job.company)}`}
                                                    className='shrink-0 font-medium uppercase tracking-wide no-underline transition-colors hover:text-[var(--violet-deep)]'
                                                >
                                                    {job.company}
                                                </Link>
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        cycleCompany(job.company)
                                                    }}
                                                    title={
                                                        compIncluded
                                                            ? 'Including this company — click to exclude'
                                                            : compExcluded
                                                              ? 'Excluding this company — click to clear'
                                                              : 'Include this company in the filters'
                                                    }
                                                    aria-label='Include or exclude this company'
                                                    className={clsx(
                                                        'grid size-4 shrink-0 place-items-center rounded-[4px] border text-[11px] font-semibold leading-none transition-colors',
                                                        compIncluded
                                                            ? 'border-[var(--violet-solid)] bg-[var(--violet-solid)] text-white'
                                                            : compExcluded
                                                              ? 'border-[#ef4444] bg-[#ef4444] text-white'
                                                              : 'border-[var(--line-strong)] text-[var(--ink-mute)] opacity-0 hover:text-[var(--ink)] group-hover:opacity-100',
                                                    )}
                                                >
                                                    {compIncluded ? '✓' : compExcluded ? '−' : '+'}
                                                </button>
                                                <span className='opacity-40'>·</span>
                                            </span>
                                        )}
                                        <span className='flex min-w-0 items-center gap-1 text-[var(--ink-soft)]'>
                                        <MapPinIcon width={10} height={10} className='shrink-0' />
                                            <span className='truncate max-sm:hidden'>{job.location}</span>
                                            <span className='truncate sm:hidden'>{getCountry(job.location)}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className='flex shrink-0 items-center gap-2'>
                                    {salary && (
                                        <span className='hidden text-[12.5px] font-medium text-[var(--emerald)] sm:inline'>{salary}</span>
                                    )}
                                    {formattedDate && (
                                        <span
                                            className={clsx(
                                                'rounded-[var(--radius-pill)] px-[6px] py-0.5 text-[10px] font-medium',
                                                formattedDate === 'New'
                                                    ? 'bg-[var(--brand-tint)] text-[var(--brand-deep)]'
                                                    : 'bg-[var(--paper-3)] text-[var(--ink-soft)]',
                                            )}
                                        >
                                            {formattedDate}
                                        </span>
                                    )}
                                    <div className='flex items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100'>
                                        <a
                                            href={addUtmParams(job.url)}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            aria-label='Open job posting'
                                            className='grid size-6 place-items-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)]'
                                        >
                                            <ExternalLinkIcon width={12} height={12} />
                                        </a>
                                        <AppliedJobButton atsId={job.ats_id} name={job.title} company={job.company} variant='icon' />
                                        <SaveJobButton atsId={job.ats_id} name={job.title} company={job.company} variant='icon' />
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Pagination */}
            {!isPending && totalPages > 1 && (
                <nav className='flex flex-wrap items-center justify-center gap-1.5 pt-1' aria-label='Pagination'>
                    <button
                        type='button'
                        onClick={() => goToPage(currentPage - 1)}
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
                                onClick={() => goToPage(p)}
                                className={pageBtn(p === currentPage)}
                                aria-current={p === currentPage ? 'page' : undefined}
                            >
                                {p}
                            </button>
                        ),
                    )}
                    <button
                        type='button'
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className='inline-flex h-8 cursor-pointer items-center gap-1 rounded-md pl-2.5 pr-1.5 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40'
                    >
                        Next
                        <ChevronRightIcon width={15} height={15} />
                    </button>
                </nav>
            )}

            <FilterDialog
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                jobs={jobs}
                current={currentFilters}
                onApplyFilters={handleApplyFilters}
                sortBy={sortBy}
                onSortChange={handleSortChange}
            />
        </div>
    )
}

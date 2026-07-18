'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { useSaved } from '@/hooks/use-saved'
import { SaveJobButton } from '@/components/SaveJobButton'
import { UnavailableJobCard } from '@/components/UnavailableJobCard'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatJobDate, getJobDate } from '@/utils/format'
import { formatExperience, formatSalary } from '@/utils/format'
import { useDebounce } from '@/hooks/use-debounce'
import { addUtmParams, getCountry } from '@/utils/format'
import { matchesSearchTerm } from '@/utils/search'
import type { JobMarker } from '@/types'
import { JobListSkeleton } from './JobListSkeleton'
import { JobListSearchSort } from './JobListSearchSort'
import { EmptyStateNoItems } from './EmptyStateNoItems'
import { EmptyStateNoResults } from './EmptyStateNoResults'
import { Bookmark, MapPinIcon, ExternalLinkIcon } from './icons'

type SortOption = 'title' | 'company' | 'location' | 'recent'

interface SavedJobsListProps {
    jobs: JobMarker[]
}

export function SavedJobsList({ jobs }: SavedJobsListProps) {
    const { savedIds, saved, unsaveJob, clearAll, isLoading } = useSaved()
    const [searchText, setSearchText] = useState('')
    const debouncedSearchText = useDebounce(searchText, 300)
    const [sortBy, setSortBy] = useState<SortOption>('recent')
    const [confirmClear, setConfirmClear] = useState(false)

    const availableSavedJobs = useMemo(() => jobs.filter((job) => savedIds.includes(job.ats_id)), [jobs, savedIds])

    const unavailableJobs = useMemo(() => saved.filter((savedItem) => !jobs.find((job) => job.ats_id === savedItem.ats_id)), [saved, jobs])

    const processedJobs = useMemo(() => {
        let filtered = availableSavedJobs

        if (debouncedSearchText.trim()) {
            const searchTerms = debouncedSearchText
                .toLowerCase()
                .split(/\s+/)
                .filter((term) => term.length > 0)

            filtered = filtered.filter((job) =>
                searchTerms.every(
                    (term) =>
                        matchesSearchTerm(job.title, term) || matchesSearchTerm(job.company, term) || matchesSearchTerm(job.location, term),
                ),
            )
        }

        const sorted = [...filtered]
        switch (sortBy) {
            case 'location':
                sorted.sort((a, b) => a.location.localeCompare(b.location))
                break
            case 'company':
                sorted.sort((a, b) => a.company.localeCompare(b.company))
                break
            case 'recent':
                sorted.sort((a, b) => {
                    const dateA = getJobDate(a)
                    const dateB = getJobDate(b)
                    if (!dateA && !dateB) return 0
                    if (!dateA) return 1
                    if (!dateB) return -1
                    return dateB.getTime() - dateA.getTime()
                })
                break
            case 'title':
            default:
                sorted.sort((a, b) => a.title.localeCompare(b.title))
                break
        }

        return sorted
    }, [availableSavedJobs, debouncedSearchText, sortBy])

    const totalSavedCount = savedIds.length
    const hasAnySavedJobs = totalSavedCount > 0

    if (isLoading) return <JobListSkeleton />

    return (
        <div className='space-y-3'>
            {hasAnySavedJobs && (
                <div className='flex items-center justify-between'>
                    <div className='text-[13px] text-[var(--ink-mute)]'>
                        {totalSavedCount} saved job{totalSavedCount === 1 ? '' : 's'}
                    </div>
                    <div className='relative'>
                        <button
                            onClick={() => setConfirmClear(true)}
                            className='text-[11px] text-red-400/80 hover:text-red-400 transition-colors font-medium'
                        >
                            Clear All
                        </button>
                        <ConfirmDialog
                            open={confirmClear}
                            onConfirm={() => {
                                clearAll()
                                setConfirmClear(false)
                            }}
                            onCancel={() => setConfirmClear(false)}
                            message='Clear all saved jobs?'
                            confirmLabel='Clear All'
                        />
                    </div>
                </div>
            )}

            {hasAnySavedJobs && (
                <JobListSearchSort
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    sortBy={sortBy}
                    onSortChange={(v) => setSortBy(v as SortOption)}
                    sortOptions={[
                        { value: 'recent', label: 'Recent' },
                        { value: 'title', label: 'Title' },
                        { value: 'company', label: 'Company' },
                        { value: 'location', label: 'Location' },
                    ]}
                    placeholder='Search saved jobs...'
                    resultCount={processedJobs.length}
                    searchResultLabel='saved jobs'
                />
            )}

            <div className='min-h-[400px]'>
                {!hasAnySavedJobs ? (
                    <EmptyStateNoItems
                        icon={<Bookmark width={32} height={32} className='text-[var(--ink-mute)]' fill='none' />}
                        title='No saved jobs yet'
                        description="Start saving jobs you're interested in to view them here later"
                    />
                ) : processedJobs.length === 0 && !unavailableJobs.length ? (
                    <EmptyStateNoResults />
                ) : (
                    <>
                        {processedJobs.length > 0 && (
                            <div className='divide-y divide-white/5'>
                                {processedJobs.map((job, index) => {
                                    const uniqueKey = job.ats_id || `${job.company}-${job.title}-${index}`
                                    return (
                                        <div key={uniqueKey} className='pr-4 pt-2.5 pb-2.5'>
                                            <div className='flex items-start justify-between gap-3 mb-1'>
                                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                                    <a
                                                        href={addUtmParams(job.url)}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='text-[14px] md:text-[16px] font-medium text-[var(--ink)] leading-normal m-0 no-underline hover:text-[var(--brand)] transition-colors'
                                                    >
                                                        {job.title}
                                                    </a>
                                                    {formatExperience(job.experience) && (
                                                        <span className='text-[12px] md:text-[13px] text-[var(--ink-faint)] shrink-0'>
                                                            {formatExperience(job.experience)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='flex items-center gap-1.5 shrink-0'>
                                                    {formatJobDate(job) && (
                                                        <span
                                                            className={clsx(
                                                                'text-[10px] md:text-[11px] font-medium rounded-full px-[6px] py-0.5 border',
                                                                formatJobDate(job) === 'New'
                                                                    ? 'bg-[var(--brand-tint)] text-[var(--brand-deep)] border-[var(--brand-tint)]'
                                                                    : 'bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)]',
                                                            )}
                                                        >
                                                            {formatJobDate(job)}
                                                        </span>
                                                    )}
                                                    <SaveJobButton
                                                        atsId={job.ats_id}
                                                        name={job.title}
                                                        company={job.company}
                                                        variant='icon'
                                                    />
                                                </div>
                                            </div>

                                            <div className='text-[13px] md:text-[15px] text-[var(--ink-soft)] mb-1.5 max-sm:hidden'>
                                                <span className='uppercase'>{job.company}</span>
                                            </div>

                                            <div className='flex items-center gap-2 text-[13px] md:text-[15px] text-[var(--ink-mute)] mb-2 flex-wrap'>
                                                <div className='flex items-center gap-1'>
                                                    <MapPinIcon width={12} height={12} className='md:w-[14px] md:h-[14px]' />
                                                    <span className='max-sm:hidden'>{job.location}</span>
                                                    <span className='sm:hidden'>{getCountry(job.location)}</span>
                                                </div>
                                                {formatSalary(job) && (
                                                    <span className='text-[var(--emerald)] font-medium'>{formatSalary(job)}</span>
                                                )}
                                            </div>

                                            <div className='flex items-center gap-2'>
                                                <Link
                                                    href={addUtmParams(job.url)}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] no-underline rounded-full text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]'
                                                >
                                                    View Job
                                                    <ExternalLinkIcon width={10} height={10} className='md:w-[11px] md:h-[11px]' />
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {unavailableJobs.length > 0 && (
                            <div className='mt-8 pt-8 border-t border-[var(--line)]'>
                                <h3 className='text-[14px] font-medium text-[var(--ink-soft)] mb-3'>
                                    No Longer Available ({unavailableJobs.length})
                                </h3>
                                <div className='divide-y divide-[var(--line)]'>
                                    {unavailableJobs.map((savedJob) => (
                                        <UnavailableJobCard
                                            key={savedJob.ats_id}
                                            atsId={savedJob.ats_id}
                                            name={savedJob.name}
                                            company={savedJob.company}
                                            onRemove={unsaveJob}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

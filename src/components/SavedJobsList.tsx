'use client'

import { useState, useMemo } from 'react'
import { useSaved } from '@/hooks/use-saved'
import { SaveJobButton } from '@/components/SaveJobButton'
import { UnavailableJobCard } from '@/components/UnavailableJobCard'
import { useDebounce } from '@/hooks/use-debounce'
import { getCountry } from '@/utils/format'
import { filterJobsBySearch, sortJobsByLocation, sortJobsByCompany, sortJobsByRecent, sortJobsByTitle } from '@/utils/job-list-utils'
import type { JobMarker } from '@/types'
import { JobListSkeleton } from './JobListSkeleton'
import { JobListSearchSort } from './JobListSearchSort'
import { EmptyStateNoItems } from './EmptyStateNoItems'
import { EmptyStateNoResults } from './EmptyStateNoResults'
import { JobListItem } from './JobListItem'
import { ClearAllConfirm } from './ClearAllConfirm'
import { Bookmark } from './icons'

type SortOption = 'title' | 'company' | 'location' | 'recent'

interface SavedJobsListProps {
    jobs: JobMarker[]
}

export function SavedJobsList({ jobs }: SavedJobsListProps) {
    const { savedIds, saved, unsaveJob, clearAll, isLoading } = useSaved()
    const [searchText, setSearchText] = useState('')
    const debouncedSearchText = useDebounce(searchText, 300)
    const [sortBy, setSortBy] = useState<SortOption>('recent')

    const availableSavedJobs = useMemo(() => jobs.filter((job) => savedIds.includes(job.ats_id)), [jobs, savedIds])

    const unavailableJobs = useMemo(() => saved.filter((savedItem) => !jobs.find((job) => job.ats_id === savedItem.ats_id)), [saved, jobs])

    const processedJobs = useMemo(() => {
        let filtered = filterJobsBySearch(availableSavedJobs, debouncedSearchText)

        const sorted = [...filtered]
        switch (sortBy) {
            case 'location':
                sortJobsByLocation(sorted)
                break
            case 'company':
                sortJobsByCompany(sorted)
                break
            case 'recent':
                sortJobsByRecent(sorted)
                break
            case 'title':
            default:
                sortJobsByTitle(sorted)
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
                    <ClearAllConfirm message='Clear all saved jobs?' onClear={clearAll} />
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
                                {processedJobs.map((job, index) => (
                                    <JobListItem
                                        key={job.ats_id || `${job.company}-${job.title}-${index}`}
                                        job={job}
                                        titleLinkHoverClass='hover:text-[var(--brand)]'
                                        hideCompanyMobile
                                        locationChildren={
                                            <>
                                                <span className='max-sm:hidden'>{job.location}</span>
                                                <span className='sm:hidden'>{getCountry(job.location)}</span>
                                            </>
                                        }
                                        actions={
                                            <SaveJobButton
                                                atsId={job.ats_id}
                                                name={job.title}
                                                company={job.company}
                                                variant='icon'
                                            />
                                        }
                                    />
                                ))}
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

'use client'

import { useState, useMemo } from 'react'
import { useApplied } from '@/hooks/use-applied'
import { AppliedJobButton } from '@/components/AppliedJobButton'
import { UnavailableJobCard } from '@/components/UnavailableJobCard'
import { formatAppliedDate, formatAppliedInputDate, toIsoFromDateInput } from '@/utils/format'
import { getJobDate } from '@/utils/format'
import { useDebounce } from '@/hooks/use-debounce'
import { matchesSearchTerm } from '@/utils/search'
import type { JobMarker } from '@/types'
import { JobListSkeleton } from './JobListSkeleton'
import { JobListSearchSort } from './JobListSearchSort'
import { EmptyStateNoItems } from './EmptyStateNoItems'
import { EmptyStateNoResults } from './EmptyStateNoResults'
import { JobListItem } from './JobListItem'
import { ClearAllConfirm } from './ClearAllConfirm'
import { Checkmark } from './icons'

type SortOption = 'applied' | 'title' | 'company' | 'location' | 'recent'

interface AppliedJobsListProps {
    jobs: JobMarker[]
}

export function AppliedJobsList({ jobs }: AppliedJobsListProps) {
    const { appliedIds, applied, unmarkApplied, updateAppliedDate, clearAll, isLoading } = useApplied()
    const [searchText, setSearchText] = useState('')
    const debouncedSearchText = useDebounce(searchText, 300)
    const [sortBy, setSortBy] = useState<SortOption>('applied')
    const [editingJobId, setEditingJobId] = useState<string | null>(null)
    const [editDateValue, setEditDateValue] = useState<string>('')

    const appliedJobsMap = useMemo(() => new Map(applied.map((job) => [job.ats_id, job])), [applied])

    const availableAppliedJobs = useMemo(() => jobs.filter((job) => appliedIds.includes(job.ats_id)), [jobs, appliedIds])

    const unavailableJobs = useMemo(
        () => applied.filter((appliedJob) => !jobs.find((job) => job.ats_id === appliedJob.ats_id)),
        [applied, jobs],
    )

    const processedJobs = useMemo(() => {
        let filtered = availableAppliedJobs

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
            case 'applied':
                sorted.sort((a, b) => {
                    const appliedA = appliedJobsMap.get(a.ats_id)?.applied_at
                    const appliedB = appliedJobsMap.get(b.ats_id)?.applied_at
                    const timeA = appliedA ? Date.parse(appliedA) : Number.NEGATIVE_INFINITY
                    const timeB = appliedB ? Date.parse(appliedB) : Number.NEGATIVE_INFINITY
                    return timeB - timeA
                })
                break
            case 'title':
            default:
                sorted.sort((a, b) => a.title.localeCompare(b.title))
                break
        }

        return sorted
    }, [availableAppliedJobs, debouncedSearchText, sortBy, appliedJobsMap])

    const totalAppliedCount = appliedIds.length
    const hasAnyAppliedJobs = totalAppliedCount > 0

    if (isLoading) return <JobListSkeleton />

    return (
        <div className='space-y-3'>
            {hasAnyAppliedJobs && (
                <div className='flex items-center justify-between'>
                    <div className='text-[13px] text-[var(--ink-mute)]'>
                        {totalAppliedCount} applied job{totalAppliedCount === 1 ? '' : 's'}
                    </div>
                    <ClearAllConfirm message='Clear all applied jobs?' onClear={clearAll} />
                </div>
            )}

            {hasAnyAppliedJobs && (
                <JobListSearchSort
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    sortBy={sortBy}
                    onSortChange={(v) => setSortBy(v as SortOption)}
                    sortOptions={[
                        { value: 'applied', label: 'Applied' },
                        { value: 'recent', label: 'Recent' },
                        { value: 'title', label: 'Title' },
                        { value: 'company', label: 'Company' },
                        { value: 'location', label: 'Location' },
                    ]}
                    placeholder='Search applied jobs...'
                    resultCount={processedJobs.length}
                    searchResultLabel='applied jobs'
                />
            )}

            <div className='min-h-[400px]'>
                {!hasAnyAppliedJobs ? (
                    <EmptyStateNoItems
                        icon={<Checkmark width={32} height={32} className='text-[var(--ink-mute)]' />}
                        title='No applied jobs yet'
                        description='Mark jobs as applied to track your progress here'
                    />
                ) : processedJobs.length === 0 && !unavailableJobs.length ? (
                    <EmptyStateNoResults />
                ) : (
                    <>
                        {processedJobs.length > 0 && (
                            <div className='divide-y divide-white/5'>
                                {processedJobs.map((job, index) => {
                                    const appliedAt = appliedJobsMap.get(job.ats_id)?.applied_at
                                    const appliedDate = formatAppliedDate(appliedAt)
                                    const isEditing = editingJobId === job.ats_id

                                    return (
                                        <JobListItem
                                            key={job.ats_id || `${job.company}-${job.title}-${index}`}
                                            job={job}
                                            actions={
                                                <>
                                                    {appliedDate && !isEditing && (
                                                        <span className='text-[10px] md:text-[11px] font-medium rounded-full px-[6px] py-0.5 border bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)]'>
                                                            Applied {appliedDate}
                                                        </span>
                                                    )}
                                                    <AppliedJobButton
                                                        atsId={job.ats_id}
                                                        name={job.title}
                                                        company={job.company}
                                                        variant='icon'
                                                    />
                                                </>
                                            }
                                            bottomActions={
                                                !isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingJobId(job.ats_id)
                                                                setEditDateValue(formatAppliedInputDate(appliedAt))
                                                            }}
                                                            className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] rounded-full text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]'
                                                        >
                                                            Edit date
                                                        </button>
                                                        <button
                                                            onClick={() => unmarkApplied(job.ats_id)}
                                                            className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] rounded-full text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400'
                                                        >
                                                            Remove
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className='flex items-center gap-2'>
                                                        <input
                                                            type='date'
                                                            value={editDateValue}
                                                            onChange={(e) => setEditDateValue(e.target.value)}
                                                            className='px-2 py-0.5 rounded-full bg-[var(--paper-3)] text-[var(--ink)] text-[11px] md:text-[12px] border border-[var(--line)]'
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                updateAppliedDate(job.ats_id, toIsoFromDateInput(editDateValue))
                                                                setEditingJobId(null)
                                                            }}
                                                            className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] rounded-full text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]'
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingJobId(null)
                                                                setEditDateValue('')
                                                            }}
                                                            className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] rounded-full text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]'
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )
                                            }
                                        />
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
                                    {unavailableJobs.map((appliedJob) => (
                                        <UnavailableJobCard
                                            key={appliedJob.ats_id}
                                            atsId={appliedJob.ats_id}
                                            name={appliedJob.name}
                                            company={appliedJob.company}
                                            onRemove={unmarkApplied}
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

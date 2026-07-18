'use client'

import { useClientJobs, LoadingJobs } from '@/hooks/use-client-jobs'
import { AllJobsList } from './AllJobsList'
import { AppliedJobsList } from './AppliedJobsList'
import { SavedJobsList } from './SavedJobsList'

export function AllJobsListClient({ hideCompanyName }: { hideCompanyName?: boolean }) {
    const jobs = useClientJobs()
    if (!jobs) return <LoadingJobs />
    return <AllJobsList jobs={jobs} hideCompanyName={hideCompanyName} />
}

export function AppliedJobsListClient() {
    const jobs = useClientJobs()
    if (!jobs) return <LoadingJobs />
    return <AppliedJobsList jobs={jobs} />
}

export function SavedJobsListClient() {
    const jobs = useClientJobs()
    if (!jobs) return <LoadingJobs />
    return <SavedJobsList jobs={jobs} />
}

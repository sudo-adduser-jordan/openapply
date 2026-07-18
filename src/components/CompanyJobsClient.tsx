'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { AllJobsList } from './AllJobsList'
import { slugify } from '@/utils/format'
import { useClientJobs, LoadingJobs } from '@/hooks/use-client-jobs'

export function CompanyJobsClient() {
    const params = useParams()
    const companySlug = params.company as string
    const allJobs = useClientJobs()

    const filteredJobs = useMemo(() => {
        if (!allJobs) return null
        return allJobs.filter((job) => slugify(job.company) === companySlug)
    }, [allJobs, companySlug])

    if (!filteredJobs) return <LoadingJobs />
    return <AllJobsList jobs={filteredJobs} hideCompanyName={true} />
}

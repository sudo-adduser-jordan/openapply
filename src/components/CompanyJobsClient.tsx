'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { AllJobsList } from './AllJobsList'
import type { JobMarker } from '@/types'

interface CompanyJobsClientProps {
    jobs: JobMarker[]
}

export function CompanyJobsClient({ jobs }: CompanyJobsClientProps) {
    const params = useParams()
    const companySlug = params.company as string

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const slug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            return slug === companySlug
        })
    }, [jobs, companySlug])

    return <AllJobsList jobs={filteredJobs} hideCompanyName={true} />
}

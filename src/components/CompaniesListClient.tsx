'use client'

import { useMemo } from 'react'
import type { JobMarker } from '@/types'
import { CompaniesList } from './CompaniesList'
import { deriveCompaniesFromJobs } from '@/utils/client-companies'

interface CompaniesListClientProps {
    jobs: JobMarker[]
}

export function CompaniesListClient({ jobs }: CompaniesListClientProps) {
    const companies = useMemo(() => deriveCompaniesFromJobs(jobs), [jobs])
    return <CompaniesList companies={companies} />
}

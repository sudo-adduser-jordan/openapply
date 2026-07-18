export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { CompaniesListClient } from '@/components/CompaniesListClient'
import { fetchJobsSafe } from '@/utils/jobs'
import { computeManifestStats } from '@/utils/client-manifest'
import DirectoryLayout from '@/components/DirectoryLayout'

export const metadata: Metadata = {
    title: 'Companies | OpenApply',
}

export default async function CompaniesDirectoryPage() {
    const jobs = await fetchJobsSafe()
    return (
        <DirectoryLayout title='Companies' stats={computeManifestStats(jobs)}>
            <CompaniesListClient jobs={jobs} />
        </DirectoryLayout>
    )
}

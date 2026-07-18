export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { AllJobsList } from '@/components/AllJobsList'
import { fetchJobsSafe } from '@/utils/jobs'
import { computeManifestStats } from '@/utils/client-manifest'
import DirectoryLayout from '@/components/DirectoryLayout'

export const metadata: Metadata = {
    title: 'Jobs | OpenApply',
}

export default async function JobsDirectoryPage() {
    const jobs = await fetchJobsSafe()
    return (
        <DirectoryLayout title='Jobs' stats={computeManifestStats(jobs)}>
            <AllJobsList jobs={jobs} now={Date.now()} />
        </DirectoryLayout>
    )
}

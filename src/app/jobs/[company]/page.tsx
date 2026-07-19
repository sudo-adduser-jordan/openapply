import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { CompanyJobsClient } from '@/components/CompanyJobsClient'
import { JobPageStatsClient } from '@/components/JobPageStatsClient'
import { fetchJobsSafe } from '@/utils/jobs'

export const metadata: Metadata = {
    title: 'Company Jobs | OpenApply',
}

import { computeManifestStats } from '@/utils/client-manifest'

export default async function JobsPage() {
    const jobs = await fetchJobsSafe()
    const stats = computeManifestStats(jobs)

    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl space-y-8 px-6 pb-16 pt-8'>
                <header>
                    <h1 className='text-3xl font-semibold uppercase tracking-tight md:text-4xl'>
                        Company Jobs
                        <span className='ml-3 text-sm font-normal text-[var(--ink-soft)]'>
                            <JobPageStatsClient stats={stats} />
                        </span>
                    </h1>
                </header>

                <CompanyJobsClient jobs={jobs} now={Date.now()} />
            </main>

            <Footer />
        </div>
    )
}

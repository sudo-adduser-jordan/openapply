import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { CompanyJobsClient } from '@/components/CompanyJobsClient'
import { JobPageStatsClient } from '@/components/JobPageStatsClient'

export const metadata: Metadata = {
    title: 'Company Jobs | OpenApply',
}

export default function JobsPage() {
    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl space-y-8 px-6 pb-16 pt-8'>
                <header>
                    <h1 className='text-3xl font-semibold uppercase tracking-tight md:text-4xl'>
                        Company Jobs
                        <span className='ml-3 text-sm font-normal text-[var(--ink-soft)]'>
                            <JobPageStatsClient />
                        </span>
                    </h1>
                </header>

                <CompanyJobsClient />
            </main>

            <Footer />
        </div>
    )
}

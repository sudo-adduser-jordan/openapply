export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { SavedJobsList } from '@/components/SavedJobsList'
import { fetchJobsSafe } from '@/utils/jobs'

export const metadata: Metadata = {
    title: 'Saved Jobs | OpenApply',
}

export default async function SavedJobsPage() {
    const jobs = await fetchJobsSafe()

    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-8'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>Saved jobs</h1>
                </div>

                <SavedJobsList jobs={jobs} />
            </main>

            <Footer />
        </div>
    )
}

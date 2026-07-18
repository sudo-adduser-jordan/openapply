import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { AppliedJobsListClient } from '@/components/JobListsClient'

export const metadata: Metadata = {
    title: 'Applied Jobs | OpenApply',
}

export default function AppliedJobsPage() {
    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-8'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>Applied jobs</h1>
                </div>

                <AppliedJobsListClient />
            </main>

            <Footer />
        </div>
    )
}

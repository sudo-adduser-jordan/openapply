import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { JobPageStatsClient } from '@/components/JobPageStatsClient'
import { CompaniesListClient } from '@/components/CompaniesListClient'

export const metadata: Metadata = {
    title: 'Companies | OpenApply',
}

export default function CompaniesDirectoryPage() {
    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl space-y-8 px-6 pb-16 pt-8'>
                <header>
                    <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
                        Companies
                        <span className='ml-3 text-sm font-normal text-[var(--ink-soft)]'>
                            <JobPageStatsClient />
                        </span>
                    </h1>
                </header>

                <CompaniesListClient />
            </main>

            <Footer />
        </div>
    )
}

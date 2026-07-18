import type { ReactNode } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { JobPageStatsClient } from '@/components/JobPageStatsClient'
import type { ManifestStats } from '@/utils/client-manifest'

interface DirectoryLayoutProps {
    title: string
    stats: ManifestStats
    children: ReactNode
}

export default function DirectoryLayout({ title, stats, children }: DirectoryLayoutProps) {
    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl space-y-8 px-6 pb-16 pt-8'>
                <header>
                    <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
                        {title}
                        <span className='ml-3 text-sm font-normal text-[var(--ink-soft)]'>
                            <JobPageStatsClient stats={stats} />
                        </span>
                    </h1>
                </header>

                {children}
            </main>

            <Footer />
        </div>
    )
}

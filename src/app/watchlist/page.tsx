import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { WatchlistContent } from '@/components/WatchlistContent'

export const metadata: Metadata = {
    title: 'Watchlist | OpenApply',
}

export default function WatchlistPage() {
    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-8'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>Watchlist</h1>
                    <p className='mt-1 text-[14px] text-[var(--ink-mute)]'>Companies you&apos;re tracking — browse their latest openings</p>
                </div>

                <WatchlistContent />
            </main>

            <Footer />
        </div>
    )
}

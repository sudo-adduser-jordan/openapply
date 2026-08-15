export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { ManifestAtsCard } from '@/components/ManifestAtsCard'
import { ManifestFilterableGrid } from '@/components/ManifestFilterableGrid'
import { TimeAgo } from '@/components/TimeAgo'
import { fetchManifest } from '@/utils/manifest'
import {
    computeManifest,
    computeJobAtsCards,
    computeCompanyAtsCards,
    computeCompanyCards,
    computeWatchlistCards,
} from '@/utils/client-manifest'

export const metadata: Metadata = {
    title: 'Manifest | OpenApply',
}

const borderClasses = [
    'border-r border-b md:border-b-0',
    'border-b md:border-b-0 md:border-r',
    'border-r border-b md:border-b-0',
    'border-b md:border-b-0',
]

const dotColors = ['var(--c-blue)', 'var(--c-emerald)', 'var(--c-amber)', 'var(--c-violet)']

function formatDate(iso: string): string {
    try {
        const d = new Date(iso)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        })
    } catch {
        return iso
    }
}

function StatItem({ label, value, color, idx }: { label: string; value: string; color: string; idx: number }) {
    return (
        <div className={`relative bg-[var(--paper)] px-5 py-4 border-[var(--line)] ${borderClasses[idx]}`}>
            <dt className='inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--muted)]'>
                <span aria-hidden='true' className='inline-block h-1 w-1 rounded-full' style={{ background: color }} />
                {label}
            </dt>
            <dd className='mt-1 text-xl'>{value}</dd>
        </div>
    )
}

function UpdatedStatItem({ iso, idx }: { iso: string; idx: number }) {
    const d = new Date(iso)
    const formattedDate = d.toISOString().slice(0, 10)
    return (
        <div className={`relative bg-[var(--paper)] px-5 py-4 border-[var(--line)] ${borderClasses[idx]}`}>
            <dt className='inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--muted)]'>
                <span aria-hidden='true' className='inline-block h-1 w-1 rounded-full' style={{ background: 'var(--c-violet)' }} />
                updated
            </dt>
            <dd className='mt-1 text-xl'>
                <TimeAgo iso={iso} />
            </dd>
            <dd className='text-xs text-[var(--muted)]'>{formattedDate}</dd>
        </div>
    )
}

function SchemaSection({ label, dotColor, columns, version }: { label: string; dotColor: string; columns: string[]; version: string }) {
    return (
        <div className='rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--fg)_1.5%,transparent)] px-5 py-4'>
            <div className='mb-3 flex items-center gap-3'>
                <span className='inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--paper-3)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]'>
                    <span aria-hidden='true' className='inline-block size-1.5 rounded-full' style={{ background: dotColor }} />
                    {label}
                </span>
                <span className='rounded-full border border-[var(--line-strong)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink-mute)]'>
                    v{version}
                </span>
                <span className='text-xs text-[var(--ink-soft)]'>{columns.length} columns</span>
            </div>
            <div className='flex flex-wrap gap-1.5'>
                {columns.map((col: string) => (
                    <code
                        key={col}
                        className='rounded bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] px-2 py-0.5 text-xs text-[var(--ink-soft)]'
                    >
                        {col}
                    </code>
                ))}
            </div>
        </div>
    )
}

export default async function ManifestPage() {
    let jobs: import('@/types').JobMarker[] = []
    let watchlistCategories: import('@/types').WatchlistCategory[] = []
    try {
        const data = await fetchManifest()
        jobs = data.jobs
        watchlistCategories = data.watchlistCategories
    } catch {
        console.error('Failed to fetch manifest data')
    }
    const watchlistTotalCompanies = watchlistCategories.reduce((s, c) => s + c.companies.length, 0)

    const manifest = computeManifest(jobs, watchlistTotalCompanies)
    const jobAtsCards = computeJobAtsCards(jobs)
    const companyAtsCards = computeCompanyAtsCards(jobs)
    const companyCards = computeCompanyCards(jobs)
    const watchlistCards = computeWatchlistCards(watchlistCategories)

    const stats = [
        { label: 'jobs', value: manifest.stats.total_jobs.toLocaleString(), colorIndex: 0 },
        { label: 'companies', value: manifest.stats.total_companies.toLocaleString(), colorIndex: 1 },
        { label: 'ats platforms', value: String(manifest.stats.ats_count), colorIndex: 2 },
    ]

    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='mx-auto w-full max-w-7xl px-6 py-12 md:py-16'>
                <header className='mb-14'>
                    <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>Data Manifest</h1>
                    <p className='mt-2 text-sm text-[var(--ink-soft)]'>
                        Dataset overview of all job listings. Generated{' '}
                        <time dateTime={manifest.generated_at}>{formatDate(manifest.generated_at)}</time>
                    </p>
                </header>

                <div className='mb-6 flex items-center gap-2'>
                    <span className='inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--muted)]'>
                        <span aria-hidden='true' className='inline-block size-1.5 rounded-full bg-[var(--c-emerald)]' />
                        24h retention
                    </span>
                </div>

                <section className='mb-14'>
                    <dl className='grid grid-cols-2 overflow-hidden rounded-[16px] border-2 border-dotted border-[var(--line-strong)] md:grid-cols-4'>
                        {stats.map((s, i) => (
                            <StatItem key={s.label} label={s.label} value={s.value} color={dotColors[s.colorIndex]} idx={i} />
                        ))}
                        <UpdatedStatItem iso={manifest.updated_at} idx={3} />
                    </dl>
                </section>

                <section className='mb-12'>
                    <div className='mb-4 flex items-center justify-between gap-3'>
                        <span className='inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--paper-3)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]'>
                            <span
                                aria-hidden='true'
                                className='inline-block size-1.5 rounded-full'
                                style={{ background: 'var(--c-amber)' }}
                            />
                            Aggregated
                        </span>
                        <span className='text-xs text-[var(--muted)]'>4 files</span>
                    </div>
                    <ul className='grid grid-cols-1 gap-px overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-4'>
                        <ManifestAtsCard
                            name='all jobs'
                            rows={manifest.all.rows}
                            parquetUrl={manifest.all.parquet}
                            parquetSize={manifest.all.parquet_size_bytes}
                            description='Every job across every ATS, aggregated.'
                            minHeight='min-h-[148px]'
                        />
                        <ManifestAtsCard
                            name='all companies'
                            rows={manifest.companies.rows}
                            parquetUrl={manifest.companies.parquet}
                            parquetSize={manifest.companies.parquet_size_bytes}
                            description='Every company discovered across every ATS.'
                            minHeight='min-h-[148px]'
                        />
                        <ManifestAtsCard
                            name='all ats'
                            rows={manifest.ats.rows}
                            parquetUrl={manifest.ats.parquet}
                            parquetSize={manifest.ats.parquet_size_bytes}
                            description='Every ATS platform discovered.'
                            minHeight='min-h-[148px]'
                        />
                        <ManifestAtsCard
                            name='all watchlists'
                            rows={manifest.watchlist.rows}
                            parquetUrl={manifest.watchlist.parquet}
                            parquetSize={manifest.watchlist.parquet_size_bytes}
                            description='Watchlist, Fortune 500, Canada, US, Remote companies.'
                            minHeight='min-h-[148px]'
                        />
                    </ul>
                </section>

                <div className='space-y-12'>
                    <ManifestFilterableGrid
                        label='Jobs · per ATS'
                        dotColor='var(--c-blue)'
                        fileCount={jobAtsCards.length}
                        filterPlaceholder={`search ${jobAtsCards.length} ATSes by name…`}
                        cards={jobAtsCards.map((c) => ({
                            name: c.name,
                            element: <ManifestAtsCard name={c.name} rows={c.rows} parquetUrl={c.parquetUrl} parquetSize={c.parquetSize} />,
                        }))}
                        maxItems={12}
                    />
                    <ManifestFilterableGrid
                        label='Companies · per ATS'
                        dotColor='var(--c-emerald)'
                        fileCount={companyAtsCards.length}
                        filterPlaceholder={`search ${companyAtsCards.length} ATSes by name…`}
                        cards={companyAtsCards.map((c) => ({
                            name: c.name,
                            element: <ManifestAtsCard name={c.name} rows={c.rows} parquetUrl={c.parquetUrl} parquetSize={c.parquetSize} />,
                        }))}
                        maxItems={12}
                    />
                    <ManifestFilterableGrid
                        label='Jobs · by Company'
                        dotColor='var(--c-amber)'
                        fileCount={companyCards.length}
                        filterPlaceholder={`search ${companyCards.length} companies by name…`}
                        cards={companyCards.map((c) => ({
                            name: c.name,
                            element: <ManifestAtsCard name={c.name} rows={c.rows} parquetUrl={c.parquetUrl} parquetSize={c.parquetSize} />,
                        }))}
                        maxItems={12}
                    />
                    <ManifestFilterableGrid
                        label='Watchlists · by Category'
                        dotColor='var(--c-violet)'
                        fileCount={watchlistCards.length}
                        filterPlaceholder={`search ${watchlistCards.length} categories by name…`}
                        cards={watchlistCards.map((c) => ({
                            name: c.name,
                            element: <ManifestAtsCard name={c.name} rows={c.rows} description={c.description} parquetUrl={c.parquetUrl} />,
                        }))}
                    />
                </div>

                <section className='mt-12 space-y-6'>
                    <h2 className='text-lg font-semibold'>Schemas</h2>
                    {(
                        [
                            ['ATS', 'var(--c-amber)', manifest.schemas.ats.columns],
                            ['Companies', 'var(--c-emerald)', manifest.schemas.companies.columns],
                            ['Jobs', 'var(--c-blue)', manifest.schemas.jobs.columns],
                            ['Watchlist', 'var(--c-violet)', manifest.schemas.watchlist.columns],
                        ] as const
                    ).map(([label, dotColor, columns]) => (
                        <SchemaSection
                            key={label}
                            label={label}
                            dotColor={dotColor}
                            columns={columns}
                            version={manifest.stats.schema_version}
                        />
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    )
}

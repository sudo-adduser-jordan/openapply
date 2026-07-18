'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { ManifestAtsCard } from '@/components/ManifestAtsCard'
import { ManifestFilterableGrid } from '@/components/ManifestFilterableGrid'
import { TimeAgo } from '@/components/TimeAgo'

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

interface CardData {
    name: string
    rows: number
    parquetUrl?: string
    parquetSize?: number
    description?: string
}

interface ManifestData {
    manifest: {
        all: { parquet: string; rows: number; parquet_size_bytes: number; parquet_sha256: string }
        ats: { parquet: string; rows: number; parquet_size_bytes: number }
        companies: {
            parquet: string
            rows: number
            parquet_size_bytes: number
            parquet_sha256: string
        }
        watchlist: { parquet: string; rows: number; parquet_size_bytes: number }
        schemas: {
            ats: { columns: string[] }
            companies: { columns: string[] }
            jobs: { columns: string[] }
            watchlist: { columns: string[] }
        }
        stats: {
            ats_count: number
            jobs_24h: number
            schema_columns: string[]
            schema_version: string
            total_companies: number
            total_jobs: number
        }
        version: string
        generated_at: string
        updated_at: string
    }
    stats: { label: string; value: string; colorIndex: number }[]
    jobAtsCards: CardData[]
    companyAtsCards: CardData[]
    watchlistCards: CardData[]
    companyCards: CardData[]
}

function LoadingManifest() {
    return (
        <div className='flex flex-col items-center justify-center px-6 py-24 text-center'>
            <div className='mb-4 size-7 animate-spin rounded-full border-2 border-[var(--line-strong)] border-t-[var(--violet)]' />
            <p className='m-0 text-[14px] font-medium text-[var(--ink-soft)]'>Loading manifest…</p>
        </div>
    )
}

export default function ManifestPage() {
    const [data, setData] = useState<ManifestData | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch('/api/manifest')
            .then((res) => res.json())
            .then((d) => {
                if (!cancelled) setData(d)
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (error) {
        return (
            <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
                <PageHeader />
                <main className='mx-auto w-full max-w-7xl px-6 py-12 md:py-16'>
                    <p className='text-center text-[var(--ink-soft)]'>Failed to load manifest data.</p>
                </main>
                <Footer />
            </div>
        )
    }

    if (!data) {
        return (
            <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
                <PageHeader />
                <main className='mx-auto w-full max-w-7xl px-6 py-12 md:py-16'>
                    <LoadingManifest />
                </main>
                <Footer />
            </div>
        )
    }

    const { manifest, stats, jobAtsCards, companyAtsCards, watchlistCards, companyCards } = data

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
                        label='Watchlist · by Category'
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

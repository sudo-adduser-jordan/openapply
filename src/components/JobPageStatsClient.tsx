'use client'

import { TimeAgo } from './TimeAgo'

interface JobPageStatsClientProps {
    stats: {
        total_jobs: number
        total_companies: number
        ats_count: number
        jobs_24h: number
        updated_at?: string
    }
}

export function JobPageStatsClient({ stats }: JobPageStatsClientProps) {
    return (
        <>
            <span
                aria-hidden='true'
                className='inline-block mr-1 size-1.5 rounded-full align-middle'
                style={{ background: 'var(--c-blue)' }}
            />
            {stats.total_jobs.toLocaleString()} jobs
            <span className='mx-2 align-middle'>·</span>
            <span
                aria-hidden='true'
                className='inline-block mr-1 size-1.5 rounded-full align-middle'
                style={{ background: 'var(--c-violet)' }}
            />
            {stats.total_companies.toLocaleString()} companies
            <span className='mx-2 align-middle'>·</span>
            <span
                aria-hidden='true'
                className='inline-block mr-1 size-1.5 rounded-full align-middle'
                style={{ background: 'var(--c-amber)' }}
            />
            {stats.ats_count} ats
            <span className='mx-2 align-middle'>·</span>
            <span
                aria-hidden='true'
                className='inline-block mr-1 size-1.5 rounded-full align-middle'
                style={{ background: 'var(--c-emerald)' }}
            />
            24h
            <span className='mx-2 align-middle'>·</span>
            Updated {stats.updated_at ? <TimeAgo iso={stats.updated_at} /> : 'recently'}
        </>
    )
}

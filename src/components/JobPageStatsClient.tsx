'use client'

import { useEffect, useState } from 'react'
import { TimeAgo } from './TimeAgo'

interface Stats {
    total_jobs: number
    total_companies: number
    ats_count: number
    jobs_24h: number
    updated_at?: string
}

function LoadingStats() {
    return <span className='inline-block h-5 w-64 animate-pulse rounded bg-[var(--paper-3)] align-middle' />
}

export function JobPageStatsClient() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [updatedAt, setUpdatedAt] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        fetch('/api/stats')
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) {
                    setStats(data)
                    setUpdatedAt(data.updated_at ?? null)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStats({
                        total_jobs: 0,
                        total_companies: 0,
                        ats_count: 0,
                        jobs_24h: 0,
                    })
                }
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (!stats) return <LoadingStats />

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
            Updated {updatedAt ? <TimeAgo iso={updatedAt} /> : 'recently'}
        </>
    )
}

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { SaveCompanyButton } from '@/components/SaveCompanyButton'
import { generateCompanySlug } from '@/utils/format'
import type { JobMarker } from '@/types'

const RECENT_DAYS = 14
const JOBS_PER_PAGE = 50

interface WatchlistCompanyCardProps {
    name: string
    allJobs: JobMarker[]
    activeCategory: boolean
}

export function WatchlistCompanyCard({ name, allJobs, activeCategory }: WatchlistCompanyCardProps) {
    const slug = generateCompanySlug(name)

    const jobs = useMemo(() => {
        if (activeCategory) return []
        return allJobs.filter((j) => j.company === name).slice(0, JOBS_PER_PAGE)
    }, [allJobs, name, activeCategory])

    const [recent, setRecent] = useState(false)
    useEffect(() => {
        const now = Date.now()
        const cutoff = now - RECENT_DAYS * 24 * 60 * 60 * 1000
        setRecent(
            allJobs.some((job) => {
                if (job.company !== name || !job.posted_at) return false
                const t = new Date(job.posted_at).getTime()
                return !isNaN(t) && t >= cutoff && t <= now
            }),
        )
    }, [allJobs, name])

    return (
        <div className='group flex items-center justify-between gap-1 rounded-lg border border-[var(--line)] bg-[var(--paper-3)] px-3 py-2 hover:bg-[var(--hover-bg)] transition-colors'>
            <Link
                href={`/jobs/${slug}`}
                className='text-[12px] font-medium text-[var(--ink)] no-underline hover:text-blue-400 transition-colors truncate min-w-0'
            >
                {name}
            </Link>
            <div className='flex items-center gap-1.5 shrink-0'>
                {recent && (
                    <span className='inline-flex items-center gap-1 rounded-md bg-[var(--brand-tint)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--brand-deep)]'>
                        New
                    </span>
                )}
                {!activeCategory && jobs.length > 0 && (
                    <span className='text-[10px] text-[var(--ink-mute)]'>{jobs.length}</span>
                )}
                <SaveCompanyButton name={name} slug={slug} variant='icon' />
            </div>
        </div>
    )
}

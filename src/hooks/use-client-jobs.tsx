import { useEffect, useState } from 'react'
import type { JobMarker } from '@/types'

export function useClientJobs(): JobMarker[] | null {
    const [jobs, setJobs] = useState<JobMarker[] | null>(null)
    useEffect(() => {
        let cancelled = false
        fetch('/api/jobs?limit=50000')
            .then((r) => r.json())
            .then((d) => {
                if (!cancelled) setJobs(d.jobs)
            })
            .catch(() => {
                if (!cancelled) setJobs([])
            })
        return () => {
            cancelled = true
        }
    }, [])
    return jobs
}

export function LoadingJobs() {
    return (
        <div className='flex flex-col items-center justify-center px-6 py-24 text-center'>
            <div className='mb-4 size-7 animate-spin rounded-full border-2 border-[var(--line-strong)] border-t-[var(--violet)]' />
            <p className='m-0 text-[14px] font-medium text-[var(--ink-soft)]'>Loading jobs…</p>
        </div>
    )
}

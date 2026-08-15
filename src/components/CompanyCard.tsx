'use client'

import Link from 'next/link'
import { generateCompanySlug } from '@/utils/format'
import { SaveCompanyButton } from './SaveCompanyButton'

interface CompanyCardProps {
    name: string
    jobCount: number
    hasNewJobs: boolean
}

export function CompanyCard({ name, jobCount, hasNewJobs }: CompanyCardProps) {
    return (
        <Link
            href={`/jobs?companies=${encodeURIComponent(name)}`}
            className='group border-b border-r border-dotted border-[var(--line-strong)] p-4 no-underline transition-colors hover:bg-[var(--hover-bg)]'
        >
            <div className='mt-2 flex items-center justify-between gap-3'>
                <h3 className='truncate text-[15px] font-semibold uppercase leading-tight tracking-tight text-[var(--ink)]'>
                    {name}
                </h3>
                <span className='text-[11px] font-medium text-[var(--ink-mute)] transition-colors group-hover:text-[var(--violet-deep)]'>
                    <SaveCompanyButton name={name} slug={generateCompanySlug(name)} variant='icon' />
                </span>
            </div>
            <div className='mt-2 flex items-center justify-between gap-3'>
                <span className='flex items-center gap-2 text-[12px] font-medium text-[var(--ink-mute)]'>
                    {hasNewJobs && (
                        <span className='rounded-md bg-[var(--brand-tint)] px-[6px] py-0.5 text-[10px] font-medium text-[var(--brand-deep)]'>
                            New
                        </span>
                    )}
                    {jobCount.toLocaleString()} {jobCount === 1 ? 'opening' : 'openings'}
                </span>
                <span className='text-[11px] font-medium text-[var(--ink-mute)] transition-colors group-hover:text-[var(--violet-deep)]'>
                    View →
                </span>
            </div>
        </Link>
    )
}

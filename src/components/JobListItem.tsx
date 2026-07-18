'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { formatJobDate } from '@/utils/format'
import { formatExperience, formatSalary } from '@/utils/format'
import { addUtmParams } from '@/utils/format'
import type { JobMarker } from '@/types'
import { MapPinIcon, ExternalLinkIcon } from './icons'
import type { ReactNode } from 'react'

interface JobListItemProps {
    job: JobMarker
    titleLinkHoverClass?: string
    actions?: ReactNode
    bottomActions?: ReactNode
    hideCompanyMobile?: boolean
    locationChildren?: ReactNode
    now?: number
}

export function JobListItem({
    job,
    titleLinkHoverClass = 'hover:text-[var(--ink-soft)]',
    actions,
    bottomActions,
    hideCompanyMobile = false,
    locationChildren,
    now,
}: JobListItemProps) {
    return (
        <div className='pr-4 pt-2.5 pb-2.5'>
            <div className='flex items-start justify-between gap-3 mb-1'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                    <a
                        href={addUtmParams(job.url)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={`text-[14px] md:text-[16px] font-medium text-[var(--ink)] leading-normal m-0 no-underline ${titleLinkHoverClass} transition-colors`}
                    >
                        {job.title}
                    </a>
                    {formatExperience(job.experience) && (
                        <span className='text-[12px] md:text-[13px] text-[var(--ink-faint)] shrink-0'>
                            {formatExperience(job.experience)}
                        </span>
                    )}
                </div>
                <div className='flex items-center gap-1.5 shrink-0'>
                    {formatJobDate(job, now ? new Date(now) : undefined) && (
                        <span
                            className={clsx(
                                'text-[10px] md:text-[11px] font-medium rounded-full px-[6px] py-0.5 border',
                                formatJobDate(job, now ? new Date(now) : undefined) === 'New'
                                    ? 'bg-[var(--brand-tint)] text-[var(--brand-deep)] border-[var(--brand-tint)]'
                                    : 'bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)]',
                            )}
                        >
                            {formatJobDate(job, now ? new Date(now) : undefined)}
                        </span>
                    )}
                    {actions}
                </div>
            </div>

            <div className={`text-[13px] md:text-[15px] text-[var(--ink-soft)] mb-1.5${hideCompanyMobile ? ' max-sm:hidden' : ''}`}>
                <span className='uppercase'>{job.company}</span>
            </div>

            <div className='flex items-center gap-2 text-[13px] md:text-[15px] text-[var(--ink-mute)] mb-2 flex-wrap'>
                <div className='flex items-center gap-1'>
                    <MapPinIcon width={12} height={12} className='md:w-[14px] md:h-[14px]' />
                    {locationChildren ?? job.location}
                </div>
                {formatSalary(job) && (
                    <span className='text-[var(--emerald)] font-medium'>{formatSalary(job)}</span>
                )}
            </div>

            <div className='flex items-center gap-2 flex-wrap'>
                <Link
                    href={addUtmParams(job.url)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] no-underline rounded-full text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]'
                >
                    View Job
                    <ExternalLinkIcon width={10} height={10} className='md:w-[11px] md:h-[11px]' />
                </Link>
                {bottomActions}
            </div>
        </div>
    )
}

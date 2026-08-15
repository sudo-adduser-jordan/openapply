'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { formatExperience, formatSalary, formatJobDate, addUtmParams, getCountry } from '@/utils/format'
import type { JobMarker } from '@/types'
import { MapPinIcon, ExternalLinkIcon } from './icons'
import { AppliedJobButton } from '@/components/AppliedJobButton'
import { SaveJobButton } from '@/components/SaveJobButton'

interface JobItemRowProps {
    job: JobMarker
    index: number
    currentPage: number
    pageSize: number
    companies: string[]
    excludeCompanies: string[]
    hideCompanyName?: boolean
    onCycleCompany: (name: string) => void
    now?: number
}

export function JobItemRow({
    job,
    index,
    currentPage,
    pageSize,
    companies,
    excludeCompanies,
    hideCompanyName = false,
    onCycleCompany,
    now,
}: JobItemRowProps) {
    const uniqueKey = `${job.ats_id || job.id || 'unknown'}-${(currentPage - 1) * pageSize + index}`
    const formattedDate = now ? formatJobDate(job, new Date(now)) : formatJobDate(job)
    const salary = formatSalary(job)
    const experience = formatExperience(job.experience)
    const compIncluded = companies.includes(job.company)
    const compExcluded = excludeCompanies.includes(job.company)

    return (
        <div
            key={uniqueKey}
            className='group flex items-center justify-between gap-3 border-b border-dotted border-[var(--line-strong)] px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]'
        >
            <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                    <a
                        href={addUtmParams(job.url)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='truncate text-[15px] font-medium leading-tight text-[var(--ink)] no-underline transition-colors group-hover:text-[var(--violet-deep)]'
                    >
                        {job.title}
                    </a>
                    {experience && <span className='shrink-0 text-[11px] text-[var(--ink-mute)]'>{experience}</span>}
                </div>
                <div className='mt-0.5 flex min-w-0 items-center gap-1.5 text-[12.5px] text-[var(--ink-mute)]'>
                    {!hideCompanyName && (
                        <span className='contents max-sm:hidden'>
                            <Link
                                href={`/jobs?companies=${encodeURIComponent(job.company)}`}
                                className='shrink-0 font-medium uppercase tracking-wide no-underline transition-colors hover:text-[var(--violet-deep)]'
                            >
                                {job.company}
                            </Link>
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onCycleCompany(job.company)
                                }}
                                title={
                                    compIncluded
                                        ? 'Including this company — click to exclude'
                                        : compExcluded
                                          ? 'Excluding this company — click to clear'
                                          : 'Include this company in the filters'
                                }
                                aria-label='Include or exclude this company'
                                className={clsx(
                                    'grid size-4 shrink-0 place-items-center rounded-[4px] border text-[11px] font-semibold leading-none transition-colors',
                                    compIncluded
                                        ? 'border-[var(--violet-solid)] bg-[var(--violet-solid)] text-white'
                                        : compExcluded
                                          ? 'border-[#ef4444] bg-[#ef4444] text-white'
                                          : 'border-[var(--line-strong)] text-[var(--ink-mute)] opacity-0 hover:text-[var(--ink)] group-hover:opacity-100',
                                )}
                            >
                                {compIncluded ? '✓' : compExcluded ? '−' : '+'}
                            </button>
                            <span className='opacity-40'>·</span>
                        </span>
                    )}
                    <span className='flex min-w-0 items-center gap-1 text-[var(--ink-soft)]'>
                        <MapPinIcon width={10} height={10} className='shrink-0' />
                        <span className='truncate max-sm:hidden'>{job.location}</span>
                        <span className='truncate sm:hidden'>{getCountry(job.location)}</span>
                    </span>
                </div>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
                {salary && (
                    <span className='hidden text-[12.5px] font-medium text-[var(--emerald)] sm:inline'>{salary}</span>
                )}
                {formattedDate && (
                    <span
                        className={clsx(
                            'rounded-md px-[6px] py-0.5 text-[10px] font-medium',
                            formattedDate === 'New'
                                ? 'bg-[var(--brand-tint)] text-[var(--brand-deep)]'
                                : 'bg-[var(--paper-3)] text-[var(--ink-soft)]',
                        )}
                    >
                        {formattedDate}
                    </span>
                )}
                <div className='flex items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100'>
                    <a
                        href={addUtmParams(job.url)}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Open job posting'
                        className='grid size-6 place-items-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--paper-3)] hover:text-[var(--ink)]'
                    >
                        <ExternalLinkIcon width={12} height={12} />
                    </a>
                    <AppliedJobButton atsId={job.ats_id} name={job.title} company={job.company} variant='icon' />
                    <SaveJobButton atsId={job.ats_id} name={job.title} company={job.company} variant='icon' />
                </div>
            </div>
        </div>
    )
}

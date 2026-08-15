'use client'

import { XIcon } from './icons'

interface UnavailableJobCardProps {
    atsId: string
    name?: string
    company?: string
    onRemove: (atsId: string) => void
}

export function UnavailableJobCard({ atsId, name, company, onRemove }: UnavailableJobCardProps) {
    return (
        <div className='pr-4 pt-2.5 pb-2.5 opacity-50'>
            <div className='flex items-start justify-between gap-3'>
                <div className='flex-1'>
                    {name ? (
                        <>
                            <div className='text-[14px] md:text-[16px] font-medium text-[var(--ink-faint)] mb-1 leading-normal'>{name}</div>
                            {company && (
                                <div className='text-[13px] md:text-[15px] text-[var(--ink-faint)] mb-1.5 uppercase'>{company}</div>
                            )}
                        </>
                    ) : (
                        <div className='text-[14px] md:text-[16px] font-medium text-[var(--ink-faint)] mb-1 leading-normal'>
                            Job ID: {atsId}
                        </div>
                    )}

                    <div className='flex items-center gap-2 mb-2'>
                        <span className='text-[11px] md:text-[13px] font-medium rounded-md px-[6px] py-0.5 border bg-red-500/10 text-red-400/80 border-red-500/20'>
                            No longer available
                        </span>
                    </div>

                    <button
                        onClick={() => onRemove(atsId)}
                        className='inline-flex items-center gap-1 px-[10px] py-0.5 bg-[var(--paper-3)] text-[var(--ink)] rounded-md text-[11px] md:text-[12px] font-medium border border-[var(--line)] transition-[border-color,background-color] duration-200 ease-in-out hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400'
                    >
                        <XIcon width={10} height={10} className='md:w-[11px] md:h-[11px]' />
                        Remove
                    </button>
                </div>
            </div>
        </div>
    )
}

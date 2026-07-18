interface EmptyStateNoResultsProps {
    title?: string
    subtitle?: string
}

export function EmptyStateNoResults({ title = 'No jobs found', subtitle = 'Try adjusting your search' }: EmptyStateNoResultsProps) {
    return (
        <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
            <div className='mb-4 grid size-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper-3)]'>
                <svg
                    width='22'
                    height='22'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-[var(--ink-mute)]'
                >
                    <circle cx='11' cy='11' r='8' />
                    <path d='m21 21-4.35-4.35' />
                </svg>
            </div>
            <p className='m-0 mb-1 text-[14px] font-medium text-[var(--ink-soft)]'>{title}</p>
            <p className='m-0 text-[12px] text-[var(--ink-mute)]'>{subtitle}</p>
        </div>
    )
}

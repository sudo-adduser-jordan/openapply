export function JobListSkeleton() {
    return (
        <div className='space-y-3'>
            <div className='bg-[var(--paper-3)] rounded-xl border border-[var(--line)] h-[42px] animate-pulse' />

            <div className='flex items-center gap-2'>
                <div className='h-4 w-8 bg-[var(--paper-3)] rounded animate-pulse' />
                <div className='flex gap-1.5'>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className='h-[28px] w-16 bg-[var(--paper-3)] border border-[var(--line)] rounded-md animate-pulse' />
                    ))}
                </div>
            </div>

            <div className='min-h-[400px] divide-y divide-[var(--line)]'>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='pr-4 pt-2.5 pb-2.5 space-y-2'>
                        <div className='flex items-start justify-between gap-3'>
                            <div className='h-5 bg-[var(--paper-3)] rounded w-3/4 animate-pulse' />
                            <div className='h-5 w-12 bg-[var(--paper-3)] border border-[var(--line)] rounded-md animate-pulse shrink-0' />
                        </div>

                        <div className='h-4 bg-[var(--paper-3)] rounded w-1/3 animate-pulse' />

                        <div className='flex items-center gap-2'>
                            <div className='h-4 bg-[var(--paper-3)] rounded w-1/4 animate-pulse' />
                            <div className='h-4 bg-[var(--paper-3)] rounded w-1/5 animate-pulse' />
                        </div>

                        <div className='flex items-center gap-2'>
                            <div className='h-7 w-20 bg-[var(--paper-3)] border border-[var(--line)] rounded-md animate-pulse' />
                            <div className='h-7 w-24 bg-[var(--paper-3)] border border-[var(--line)] rounded-md animate-pulse' />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

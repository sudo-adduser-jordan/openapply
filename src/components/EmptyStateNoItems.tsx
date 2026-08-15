import Link from 'next/link'

interface EmptyStateNoItemsProps {
    icon: React.ReactNode
    title: string
    description: string
}

export function EmptyStateNoItems({ icon, title, description }: EmptyStateNoItemsProps) {
    return (
        <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
            <div className='w-16 h-16 rounded-full bg-[var(--paper-3)] border border-[var(--line)] flex items-center justify-center mb-4'>
                {icon}
            </div>
            <h2 className='text-[18px] text-[var(--ink)] font-medium mb-2'>{title}</h2>
            <p className='text-[14px] text-[var(--ink-soft)] mb-6 max-w-sm'>{description}</p>
            <div className='flex gap-3'>
                <Link
                    href='/jobs'
                    className='inline-flex items-center gap-2 px-4 py-2 bg-[var(--paper-3)] text-[var(--ink)] rounded-md border border-[var(--line)] text-[13px] font-medium no-underline transition-[border-color,background-color] duration-200 hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]'
                >
                    Browse Jobs
                </Link>
            </div>
        </div>
    )
}

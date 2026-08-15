import clsx from 'clsx'

interface SortOption {
    value: string
    label: string
}

interface JobListSearchSortProps {
    searchText: string
    onSearchChange: (v: string) => void
    sortBy: string
    onSortChange: (v: string) => void
    sortOptions: SortOption[]
    placeholder: string
    resultCount: number
    searchResultLabel: string
}

export function JobListSearchSort({
    searchText,
    onSearchChange,
    sortBy,
    onSortChange,
    sortOptions,
    placeholder,
    resultCount,
    searchResultLabel,
}: JobListSearchSortProps) {
    return (
        <div className='space-y-2'>
            <div
                className={clsx(
                    'bg-[var(--paper-3)] rounded-xl border border-[var(--line)] overflow-hidden',
                    'transition-all duration-200',
                    'focus-within:border-[var(--line-strong)] focus-within:bg-[var(--paper-2)]',
                )}
            >
                <input
                    type='text'
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={clsx(
                        'w-full px-4 py-2.5 max-sm:py-1.5',
                        'bg-transparent border-none text-[var(--ink)] text-[13px] outline-none max-sm:text-[12px]',
                        'placeholder:text-[var(--ink-faint)]',
                    )}
                />
            </div>

            <div className='flex items-center gap-2'>
                <span className='text-[11px] text-[var(--ink-mute)]'>Sort:</span>
                <div className='flex gap-1.5 flex-wrap'>
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={clsx(
                                'px-[10px] py-1 rounded-md text-[11px] font-medium',
                                'transition-[border-color,background-color] duration-200 ease-in-out cursor-pointer',
                                sortBy === option.value
                                    ? 'bg-[var(--violet-tint)] border border-[var(--violet)] text-[var(--violet)]'
                                    : 'bg-[var(--paper-3)] border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--paper-2)] hover:border-[var(--line-strong)]',
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {searchText && (
                <div className='text-[13px] text-[var(--ink-soft)]'>
                    {resultCount === 0 ? (
                        <span>
                            No {searchResultLabel} found matching &quot;{searchText}&quot;
                        </span>
                    ) : (
                        <span>
                            {resultCount} {resultCount === 1 ? 'job' : 'jobs'} found
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

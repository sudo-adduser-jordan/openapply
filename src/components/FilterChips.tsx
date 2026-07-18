import { XIcon } from './icons'

export interface Chip {
    key: string
    label: string
    color: string
    bg: string
    text: string
    onRemove: () => void
}

export function FilterChips({ chips }: { chips: Chip[] }) {
    if (chips.length === 0) return null

    return (
        <div className='flex flex-wrap items-center gap-1.5'>
            {chips.map((chip) => (
                <span
                    key={chip.key}
                    className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-[12px] font-medium ${chip.bg} ${chip.text}`}
                >
                    <span aria-hidden='true' className='inline-block size-1.5 rounded-full' style={{ background: chip.color }} />
                    {chip.label}
                    <button
                        type='button'
                        onClick={chip.onRemove}
                        className='inline-flex size-4 cursor-pointer items-center justify-center rounded-full text-current opacity-60 hover:opacity-100 transition-opacity'
                        aria-label={`Remove ${chip.label} filter`}
                    >
                        <XIcon strokeWidth={2.5} className='size-3' />
                    </button>
                </span>
            ))}
        </div>
    )
}

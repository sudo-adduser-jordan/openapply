import { DownloadIcon } from './icons'

function fmtBytes(bytes: number): string {
    if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(1) + ' GB'
    if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + ' MB'
    if (bytes >= 1_000) return (bytes / 1_000).toFixed(1) + ' KB'
    return bytes + ' B'
}

function DownloadButton({ label, size, url }: { label: string; size?: number; url?: string }) {
    const className =
        'inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2.5 text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-tint)] hover:text-[var(--brand)]'
    const content = (
        <>
            <DownloadIcon className='h-2.5 w-2.5' />
            <span className='font-medium'>{label}</span>
            {size != null && size > 0 && <span className='tabular-nums opacity-60'>{fmtBytes(size)}</span>}
        </>
    )
    if (!url) {
        return (
            <button type='button' className={className}>
                {content}
            </button>
        )
    }
    return (
        <a
            href={url}
            title={size != null && size > 0 ? `download ${label} (${fmtBytes(size)})` : `download ${label}`}
            className={className}
        >
            {content}
        </a>
    )
}

export function ManifestAtsCard({
    name,
    rows,
    parquetUrl,
    parquetSize,
    description,
    minHeight,
}: {
    name: string
    rows: number
    parquetUrl?: string
    parquetSize?: number
    description?: string
    minHeight?: string
}) {
    return (
        <div className='bg-[var(--paper)]'>
            <div className={`flex h-full w-full flex-col items-start gap-2 p-5 text-left ${minHeight ?? 'min-h-[104px]'}`}>
                <div className='flex w-full items-baseline justify-between gap-3'>
                    <span className='text-sm font-medium text-[var(--fg)]'>{name}</span>
                    <span className='shrink-0 text-xs tabular-nums text-[var(--muted)]'>{rows.toLocaleString()} rows</span>
                </div>
                {description && <span className='text-sm text-[var(--muted)]'>{description}</span>}
                {parquetUrl != null && (
                    <div className='mt-auto flex w-full items-center gap-3 pt-3'>
                        <div className='flex items-center gap-1.5'>
                            <DownloadButton label='Parquet' size={parquetSize} url={parquetUrl} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

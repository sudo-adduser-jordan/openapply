import { fetchAndParseParquet } from '@/utils/parquet'
import type { WatchlistCategory, WatchlistCompany } from '@/types'

const WATCHLIST_FILES = [
    { id: '500', name: '500', description: 'Top 500 companies', file: 'watchlists/500.parquet' },
    { id: '1000', name: '1000', description: '1000 companies', file: 'watchlists/1000.parquet' },
    { id: '2000', name: '2000', description: '2000 companies', file: 'watchlists/2000.parquet' },
]

function toString(val: unknown): string {
    if (val === null || val === undefined) return ''
    return String(val)
}

function parseWatchlistRows(rows: Record<string, unknown>[]): {
    companies: WatchlistCompany[]
    totalJobs: number
} {
    const seen = new Map<string, WatchlistCompany>()
    for (const row of rows) {
        const name = toString(row.name)
        if (!name || seen.has(name)) continue
        seen.set(name, {
            name,
            slug: toString(row.company_slug || row.ats_id || '').split('/')[0] || '',
            ats: toString(row.ats_type || row.ats || ''),
        })
    }
    return { companies: Array.from(seen.values()), totalJobs: rows.length }
}

async function loadSingleCategory(source: (typeof WATCHLIST_FILES)[number]): Promise<WatchlistCategory> {
    const table = await fetchAndParseParquet(source.file)
    const { companies, totalJobs } = parseWatchlistRows(table.toArray())
    return {
        id: source.id,
        name: source.name,
        description: source.description,
        source: source.file,
        companies,
        totalJobs,
    }
}

async function loadAllCategories(): Promise<WatchlistCategory[]> {
    return Promise.all(WATCHLIST_FILES.map(loadSingleCategory))
}

let watchlistSingleton: Promise<WatchlistCategory[]> | null = null

export async function fetchWatchlistCategories(): Promise<WatchlistCategory[]> {
    if (!watchlistSingleton) {
        watchlistSingleton = loadAllCategories()
    }
    return watchlistSingleton
}

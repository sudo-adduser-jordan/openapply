import type { JobMarker, WatchlistCategory } from '@/types'

const PARQUET_BASE = 'https://github.com/sudo-adduser-jordan/openats/raw/refs/heads/dev/data/parquet'

export interface CardData {
    name: string
    rows: number
    parquetUrl?: string
    parquetSize?: number
    description?: string
}

export interface ManifestStats {
    total_jobs: number
    total_companies: number
    ats_count: number
    jobs_24h: number
    updated_at?: string
}

export function computeManifestStats(jobs: JobMarker[]): ManifestStats {
    const companySet = new Set(jobs.map((j) => j.company))
    const atsSet = new Set(jobs.map((j) => j.ats_type).filter(Boolean))
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
    const jobs_24h = jobs.filter((j) => {
        if (!j.posted_at) return false
        const d = Date.parse(j.posted_at)
        return !isNaN(d) && d >= twentyFourHoursAgo
    }).length

    return {
        total_jobs: jobs.length,
        total_companies: companySet.size,
        ats_count: atsSet.size,
        jobs_24h,
        updated_at: new Date().toISOString(),
    }
}

interface AtsJobData {
    parquet: string
    rows: number
    parquet_size_bytes: number
}

interface AtsCompanyData {
    parquet: string
    rows: number
    parquet_size_bytes: number
}

export interface Manifest {
    all: { parquet: string; rows: number; parquet_size_bytes: number; parquet_sha256: string }
    ats: { parquet: string; rows: number; parquet_size_bytes: number }
    companies: { parquet: string; rows: number; parquet_size_bytes: number; parquet_sha256: string }
    watchlist: { parquet: string; rows: number; parquet_size_bytes: number }
    schemas: {
        ats: { columns: string[] }
        companies: { columns: string[] }
        jobs: { columns: string[] }
        watchlist: { columns: string[] }
    }
    stats: ManifestStats & { schema_columns: string[]; schema_version: string }
    version: string
    generated_at: string
    updated_at: string
}

export function computeManifest(jobs: JobMarker[], watchlistTotalCompanies: number): Manifest {
    const stats = computeManifestStats(jobs)

    const byAtsMap = new Map<string, number>()
    const byAtsCompaniesMap = new Map<string, Set<string>>()

    for (const job of jobs) {
        const ats = job.ats_type || 'unknown'
        byAtsMap.set(ats, (byAtsMap.get(ats) || 0) + 1)
        if (!byAtsCompaniesMap.has(ats)) {
            byAtsCompaniesMap.set(ats, new Set())
        }
        byAtsCompaniesMap.get(ats)!.add(job.company)
    }

    const by_ats: Record<string, AtsJobData> = {}
    for (const [name, rows] of [...byAtsMap.entries()].sort((a, b) => b[1] - a[1])) {
        by_ats[name] = { parquet: `${PARQUET_BASE}/${name}/jobs.parquet`, rows, parquet_size_bytes: 0 }
    }

    const by_ats_companies: Record<string, AtsCompanyData> = {}
    for (const [name, companies] of [...byAtsCompaniesMap.entries()].sort((a, b) => b[1].size - a[1].size)) {
        by_ats_companies[name] = {
            parquet: `${PARQUET_BASE}/${name}/companies.parquet`,
            rows: companies.size,
            parquet_size_bytes: 0,
        }
    }

    return {
        all: { parquet: `${PARQUET_BASE}/jobs_recent.parquet`, rows: stats.total_jobs, parquet_size_bytes: 0, parquet_sha256: '' },
        ats: { parquet: `${PARQUET_BASE}/ats.parquet`, rows: stats.ats_count, parquet_size_bytes: 0 },
        companies: { parquet: `${PARQUET_BASE}/companies.parquet`, rows: stats.total_companies, parquet_size_bytes: 0, parquet_sha256: '' },
        watchlist: { parquet: `${PARQUET_BASE}/watch_list.parquet`, rows: watchlistTotalCompanies, parquet_size_bytes: 0 },
        schemas: {
            ats: { columns: ['ats', 'name', 'slug', 'url', 'raw'] },
            companies: { columns: ['ats', 'name', 'slug', 'url', 'raw'] },
            jobs: {
                columns: [
                    'url', 'title', 'company', 'ats_type', 'ats_id', 'location', 'is_remote',
                    'salary_min', 'salary_max', 'salary_currency', 'salary_period', 'salary_summary',
                    'employment_type', 'department', 'team', 'description', 'posted_at',
                    'requisition_id', 'apply_url', 'commitment', 'raw', 'country_iso',
                ],
            },
            watchlist: { columns: ['ats', 'company_name', 'company_slug', 'notes', 'created_at'] },
        },
        stats: { ...stats, schema_columns: [], schema_version: '2.0' },
        version: '2.0',
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}

export function computeJobAtsCards(jobs: JobMarker[]): CardData[] {
    const byAtsMap = new Map<string, number>()
    for (const job of jobs) {
        const ats = job.ats_type || 'unknown'
        byAtsMap.set(ats, (byAtsMap.get(ats) || 0) + 1)
    }
    return [...byAtsMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, rows]) => ({
            name,
            rows,
            parquetUrl: `${PARQUET_BASE}/${name}/jobs.parquet`,
            parquetSize: 0,
        }))
}

export function computeCompanyAtsCards(jobs: JobMarker[]): CardData[] {
    const byAtsCompaniesMap = new Map<string, Set<string>>()
    for (const job of jobs) {
        const ats = job.ats_type || 'unknown'
        if (!byAtsCompaniesMap.has(ats)) byAtsCompaniesMap.set(ats, new Set())
        byAtsCompaniesMap.get(ats)!.add(job.company)
    }
    return [...byAtsCompaniesMap.entries()]
        .sort((a, b) => b[1].size - a[1].size)
        .map(([name, companies]) => ({
            name,
            rows: companies.size,
            parquetUrl: `${PARQUET_BASE}/${name}/companies.parquet`,
            parquetSize: 0,
        }))
}

export function computeCompanyCards(jobs: JobMarker[]): CardData[] {
    const jobsByCompany = new Map<string, number>()
    for (const job of jobs) {
        jobsByCompany.set(job.company, (jobsByCompany.get(job.company) || 0) + 1)
    }
    return [...jobsByCompany.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, rows]) => ({
            name,
            rows,
            parquetUrl: '',
            parquetSize: 0,
        }))
}

export function computeWatchlistCards(watchlistCategories: WatchlistCategory[]): CardData[] {
    return watchlistCategories.map((cat) => ({
        name: cat.name,
        rows: cat.companies.length,
        description: cat.description,
        parquetUrl: `${PARQUET_BASE}/${cat.source}`,
    }))
}

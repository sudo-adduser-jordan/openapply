import { fetchJobs } from './jobs'
import { fetchWatchlistCategories } from './watchlist'
import type { Manifest, AtsJobData, AtsCompanyData } from '@/types'

const BASE_URL = 'https://github.com/sudo-adduser-jordan/openats/raw/refs/heads/dev/data/parquet'

export async function fetchManifest(): Promise<Manifest> {
    const { jobs } = await fetchJobs({ limit: 50000 })

    const totalJobs = jobs.length
    const companySet = new Set(jobs.map((j) => j.company))
    const totalCompanies = companySet.size
    const atsSet = new Set(jobs.map((j) => j.ats_type).filter(Boolean))
    const atsCount = atsSet.size

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
        by_ats[name] = { parquet: `${BASE_URL}/${name}/jobs.parquet`, rows, parquet_size_bytes: 0 }
    }

    const by_ats_companies: Record<string, AtsCompanyData> = {}
    for (const [name, companies] of [...byAtsCompaniesMap.entries()].sort((a, b) => b[1].size - a[1].size)) {
        by_ats_companies[name] = {
            parquet: `${BASE_URL}/${name}/companies.parquet`,
            rows: companies.size,
            parquet_size_bytes: 0,
        }
    }

    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
    const jobs_24h = jobs.filter((j) => {
        if (!j.posted_at) return false
        const d = Date.parse(j.posted_at)
        return !isNaN(d) && d >= twentyFourHoursAgo
    }).length

    const watchlistCategories = await fetchWatchlistCategories()
    const watchlistTotalCompanies = watchlistCategories.reduce((s, c) => s + c.companies.length, 0)

    return {
        all: {
            parquet: `${BASE_URL}/jobs_recent.parquet`,
            rows: totalJobs,
            parquet_size_bytes: 0,
            parquet_sha256: '',
        },
        ats: { parquet: `${BASE_URL}/ats.parquet`, rows: atsCount, parquet_size_bytes: 0 },
        by_ats,
        by_ats_companies,
        companies: {
            parquet: `${BASE_URL}/companies.parquet`,
            rows: totalCompanies,
            parquet_size_bytes: 0,
            parquet_sha256: '',
        },
        watchlist: {
            parquet: `${BASE_URL}/watch_list.parquet`,
            rows: watchlistTotalCompanies,
            parquet_size_bytes: 0,
        },
        schemas: {
            ats: { columns: ['ats', 'name', 'slug', 'url', 'raw'] },
            companies: { columns: ['ats', 'name', 'slug', 'url', 'raw'] },
            jobs: {
                columns: [
                    'url',
                    'title',
                    'company',
                    'ats_type',
                    'ats_id',
                    'location',
                    'is_remote',
                    'salary_min',
                    'salary_max',
                    'salary_currency',
                    'salary_period',
                    'salary_summary',
                    'employment_type',
                    'department',
                    'team',
                    'description',
                    'posted_at',
                    'requisition_id',
                    'apply_url',
                    'commitment',
                    'raw',
                    'country_iso',
                ],
            },
            watchlist: { columns: ['ats', 'company_name', 'company_slug', 'notes', 'created_at'] },
        },
        stats: {
            ats_count: atsCount,
            jobs_24h,
            schema_columns: [],
            schema_version: '2.0',
            total_companies: totalCompanies,
            total_jobs: totalJobs,
        },
        version: '2.0',
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}

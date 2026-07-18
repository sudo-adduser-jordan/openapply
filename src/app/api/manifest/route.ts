import { NextResponse } from 'next/server'
import { fetchManifest } from '@/utils/manifest'
import { fetchJobs } from '@/utils/jobs'
import { fetchWatchlistCategories } from '@/utils/watchlist'

const PARQUET_BASE = 'https://github.com/sudo-adduser-jordan/openats/raw/refs/heads/dev/data/parquet'

export async function GET() {
    const m = await fetchManifest()

    const { jobs } = await fetchJobs({ limit: 50000 })
    const jobsByCompany = new Map<string, number>()
    for (const job of jobs) {
        jobsByCompany.set(job.company, (jobsByCompany.get(job.company) || 0) + 1)
    }

    const jobAtsCards = Object.entries(m.by_ats).map(([key, data]) => ({
        name: key,
        rows: data.rows,
        parquetUrl: data.parquet ?? '',
        parquetSize: 0,
    }))

    const companyAtsCards = Object.entries(m.by_ats_companies).map(([key, data]) => ({
        name: key,
        rows: data.rows,
        parquetUrl: data.parquet ?? '',
        parquetSize: 0,
    }))

    const companyCards = [...jobsByCompany.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
            name,
            rows: count,
            parquetUrl: '',
            parquetSize: 0,
        }))

    const watchlistCats = await fetchWatchlistCategories()
    const watchlistCards = watchlistCats.map((cat) => ({
        name: cat.name,
        rows: cat.companies.length,
        description: cat.description,
        parquetUrl: `${PARQUET_BASE}/${cat.source}`,
    }))

    return NextResponse.json({
        manifest: m,
        stats: [
            { label: 'jobs', value: m.stats.total_jobs.toLocaleString(), colorIndex: 0 },
            { label: 'companies', value: m.stats.total_companies.toLocaleString(), colorIndex: 1 },
            { label: 'ats platforms', value: String(m.stats.ats_count), colorIndex: 2 },
        ],
        jobAtsCards,
        companyAtsCards,
        watchlistCards,
        companyCards,
    })
}

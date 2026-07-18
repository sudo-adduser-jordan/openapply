import { fetchAndParseParquet } from '@/utils/parquet'
import type { ArrowTable, JobMarker } from '@/types'

const PARQUET_FILE = 'jobs_recent.parquet'

async function loadArrowTable(): Promise<ArrowTable> {
    return fetchAndParseParquet(PARQUET_FILE)
}

function toBool(val: unknown): boolean | null {
    if (val === null || val === undefined) return null
    if (typeof val === 'boolean') return val
    if (typeof val === 'bigint') return val !== BigInt(0)
    if (typeof val === 'number') return val !== 0
    if (typeof val === 'string') return val === '1' || val.toLowerCase() === 'true'
    return null
}

function toNum(val: unknown): number | null {
    if (val === null || val === undefined) return null
    if (typeof val === 'number') return val
    if (typeof val === 'bigint') return Number(val)
    if (typeof val === 'string') {
        const n = Number(val)
        return isNaN(n) ? null : n
    }
    return null
}

function toString(val: unknown): string | null {
    if (val === null || val === undefined) return null
    return String(val)
}

function rowToJobMarker(row: Record<string, unknown>): JobMarker {
    return {
        url: toString(row.url) || '',
        title: toString(row.title) || '',
        location: toString(row.location) || '',
        company: toString(row.company) || '',
        ats_id: toString(row.ats_id) || '',
        id: toString(row.ats_id) || toString(row.url) || '',
        salary_currency: toString(row.salary_currency),
        salary_period: toString(row.salary_period),
        salary_summary: toString(row.salary_summary),
        experience: toString(row.experience),
        posted_at: toString(row.posted_at),
        description: toString(row.description),
        ats_type: toString(row.ats_type),
        global_id: toString(row.global_id),
        is_remote: toBool(row.is_remote),
        salary_min: toNum(row.salary_min),
        salary_max: toNum(row.salary_max),
        department: toString(row.department),
        team: toString(row.team),
        employment_type: toString(row.employment_type),
        requisition_id: toString(row.requisition_id),
        apply_url: toString(row.apply_url),
        commitment: toString(row.commitment),
        country_iso: toString(row.country_iso),
        region: toString(row.region),
        lat: toNum(row.lat),
        lon: toNum(row.lon),
    }
}

async function loadAllJobs(): Promise<JobMarker[]> {
    const arrowTable = await loadArrowTable()
    const rows = arrowTable.toArray()
    const jobs = rows.map(rowToJobMarker)
    console.log(`[parquet-query] Loaded ${jobs.length} jobs from parquet`)
    return jobs
}

let jobsSingleton: Promise<JobMarker[]> | null = null

export function loadAllJobsOnce(): Promise<JobMarker[]> {
    if (!jobsSingleton) {
        jobsSingleton = loadAllJobs()
    }
    return jobsSingleton
}

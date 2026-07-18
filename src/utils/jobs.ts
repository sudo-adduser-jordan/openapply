import { loadAllJobsOnce } from '@/utils/parquet-jobs'
import { slugify } from '@/utils/format'
import type { JobMarker, CompanyWithMetadata } from '@/types'

export async function fetchJobs(
    filters: {
        company?: string
        atsType?: string
        search?: string
        location?: string
        isRemote?: boolean
        department?: string
        team?: string
        page?: number
        limit?: number
    } = {},
): Promise<{ jobs: JobMarker[]; total: number }> {
    const { company, atsType, search, location, isRemote, department, team, page = 1, limit = 50000 } = filters
    const offset = (page - 1) * limit

    let jobs = await loadAllJobsOnce()

    jobs = jobs.filter((j) => {
        if (!j.posted_at) return false
        const d = Date.parse(j.posted_at)
        return !isNaN(d) && d <= Date.now()
    })

    if (company) {
        jobs = jobs.filter((j) => j.company === company)
    }
    if (atsType) {
        jobs = jobs.filter((j) => j.ats_type === atsType)
    }
    if (search) {
        const q = search.toLowerCase()
        jobs = jobs.filter((j) => j.title.toLowerCase().includes(q))
    }
    if (location) {
        jobs = jobs.filter((j) => j.location === location)
    }
    if (isRemote !== undefined) {
        jobs = jobs.filter((j) => j.is_remote === isRemote || (isRemote && j.location === 'Remote'))
    }
    if (department) {
        jobs = jobs.filter((j) => j.department === department)
    }
    if (team) {
        jobs = jobs.filter((j) => j.team === team)
    }

    const total = jobs.length
    const paginated = jobs.slice(offset, offset + limit)

    return { jobs: paginated, total }
}

function deriveCompaniesFromJobs(jobs: JobMarker[]): CompanyWithMetadata[] {
    const map = new Map<string, CompanyWithMetadata>()

    for (const job of jobs) {
        let meta = map.get(job.company)
        if (!meta) {
            meta = {
                name: job.company,
                slug: slugify(job.company),
                ats: job.ats_type ?? null,
                url: job.url ?? null,
                jobCount: 0,
                hasRemoteJobs: false,
                hasSalary: false,
                hasNewJobs: false,
                latestPostedAt: null,
                locations: [],
                departments: [],
                teams: [],
            }
            map.set(job.company, meta)
        }

        meta.jobCount++

        if (job.is_remote === true || job.location === 'Remote') {
            meta.hasRemoteJobs = true
        }

        if (job.salary_summary || job.salary_currency || job.salary_min != null) {
            meta.hasSalary = true
        }

        if (job.posted_at) {
            const d = Date.parse(job.posted_at)
            if (isNaN(d) || d > Date.now()) continue
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
            if (d > sevenDaysAgo) {
                meta.hasNewJobs = true
            }
            if (!meta.latestPostedAt || d > Date.parse(meta.latestPostedAt)) {
                meta.latestPostedAt = job.posted_at
            }
        }

        if (job.location && !meta.locations.includes(job.location)) {
            meta.locations.push(job.location)
        }
        if (job.department && !meta.departments.includes(job.department)) {
            meta.departments.push(job.department)
        }
        if (job.team && !meta.teams.includes(job.team)) {
            meta.teams.push(job.team)
        }
    }

    return Array.from(map.values())
}

export async function fetchCompanies(): Promise<CompanyWithMetadata[]> {
    const jobs = await loadAllJobsOnce()
    const derived = deriveCompaniesFromJobs(jobs)
    return derived
}

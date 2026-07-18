import type { JobMarker, CompanyWithMetadata } from '@/types'

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function createCompanyMeta(job: JobMarker): CompanyWithMetadata {
    return {
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
}

function updateMetaWithJob(meta: CompanyWithMetadata, job: JobMarker): void {
    meta.jobCount++

    if (job.is_remote === true || job.location === 'Remote') {
        meta.hasRemoteJobs = true
    }

    if (job.salary_summary || job.salary_currency || job.salary_min != null) {
        meta.hasSalary = true
    }

    if (job.posted_at) {
        const d = Date.parse(job.posted_at)
        if (isNaN(d) || d > Date.now()) return
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

export function deriveCompaniesFromJobs(jobs: JobMarker[]): CompanyWithMetadata[] {
    const map = new Map<string, CompanyWithMetadata>()

    for (const job of jobs) {
        let meta = map.get(job.company)
        if (!meta) {
            meta = createCompanyMeta(job)
            map.set(job.company, meta)
        }
        updateMetaWithJob(meta, job)
    }

    return Array.from(map.values())
}

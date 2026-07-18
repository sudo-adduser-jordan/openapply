import { loadAllJobsOnce } from '@/utils/parquet-jobs'
import type { JobMarker } from '@/types'

export async function fetchJobsSafe(): Promise<JobMarker[]> {
    try {
        const result = await fetchJobs({ limit: 50000 })
        return result.jobs
    } catch {
        console.error('Failed to fetch jobs')
        return []
    }
}

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

    if (company) jobs = jobs.filter((j) => j.company === company)
    if (atsType) jobs = jobs.filter((j) => j.ats_type === atsType)
    if (search) {
        const q = search.toLowerCase()
        jobs = jobs.filter((j) => j.title.toLowerCase().includes(q))
    }
    if (location) jobs = jobs.filter((j) => j.location === location)
    if (isRemote !== undefined) jobs = jobs.filter((j) => j.is_remote === isRemote || (isRemote && j.location === 'Remote'))
    if (department) jobs = jobs.filter((j) => j.department === department)
    if (team) jobs = jobs.filter((j) => j.team === team)

    const total = jobs.length
    const paginated = jobs.slice(offset, offset + limit)

    return { jobs: paginated, total }
}

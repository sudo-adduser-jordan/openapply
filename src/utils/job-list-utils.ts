import { getJobDate } from '@/utils/format'
import { matchesSearchTerm } from '@/utils/search'
import type { JobMarker } from '@/types'

export function filterJobsBySearch(jobs: JobMarker[], searchText: string): JobMarker[] {
    if (!searchText.trim()) return jobs
    const searchTerms = searchText
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0)

    return jobs.filter((job) =>
        searchTerms.every(
            (term) =>
                matchesSearchTerm(job.title, term) || matchesSearchTerm(job.company, term) || matchesSearchTerm(job.location, term),
        ),
    )
}

export function sortJobsByLocation(jobs: JobMarker[]): void {
    jobs.sort((a, b) => a.location.localeCompare(b.location))
}

export function sortJobsByCompany(jobs: JobMarker[]): void {
    jobs.sort((a, b) => a.company.localeCompare(b.company))
}

export function sortJobsByRecent(jobs: JobMarker[]): void {
    jobs.sort((a, b) => {
        const dateA = getJobDate(a)
        const dateB = getJobDate(b)
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return dateB.getTime() - dateA.getTime()
    })
}

export function sortJobsByTitle(jobs: JobMarker[]): void {
    jobs.sort((a, b) => a.title.localeCompare(b.title))
}

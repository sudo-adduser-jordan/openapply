import { fetchJobs } from './jobs'
import { fetchWatchlistCategories } from './watchlist'

export async function fetchManifest() {
    const { jobs } = await fetchJobs({ limit: 50000 })
    const watchlistCategories = await fetchWatchlistCategories()
    const watchlistTotalCompanies = watchlistCategories.reduce((s, c) => s + c.companies.length, 0)
    return { jobs, watchlistCategories, watchlistTotalCompanies }
}

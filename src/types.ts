export interface JobMarker {
    url: string
    title: string
    location: string
    company: string
    ats_id: string
    id: string
    salary_currency?: string | null
    salary_period?: string | null
    salary_summary?: string | null
    experience?: string | null
    posted_at?: string | null
    description?: string | null
    ats_type?: string | null
    global_id?: string | null
    is_remote?: boolean | null
    salary_min?: number | null
    salary_max?: number | null
    department?: string | null
    team?: string | null
    employment_type?: string | null
    requisition_id?: string | null
    apply_url?: string | null
    commitment?: string | null
    country_iso?: string | null
    region?: string | null
    lat?: number | null
    lon?: number | null
}

export interface ArrowTable {
    getChild(name: string): { toArray(): unknown[] } | null
    toArray(): Record<string, unknown>[]
}

export interface WatchlistCompany {
    name: string
    slug: string
    ats: string
}

export interface WatchlistCategory {
    id: string
    name: string
    description: string
    source: string
    companies: WatchlistCompany[]
    totalJobs: number
}

export interface WatchlistMeta {
    id: string
    name: string
    createdAt: string
    sortOrder: number
}

export interface WatchlistItem {
    name: string
    slug: string
    savedAt: string
    listId: string
}

export interface CompanyWithMetadata {
    name: string
    slug: string
    ats: string | null
    url: string | null
    jobCount: number
    hasRemoteJobs: boolean
    hasSalary: boolean
    hasNewJobs: boolean
    latestPostedAt: string | null
    locations: string[]
    departments: string[]
    teams: string[]
}

export type ExperienceLevel = 'entry' | 'mid' | 'senior'

export interface Saved {
    ats_id: string
    name: string
    company: string
}

export interface UseSavedReturn {
    savedIds: string[]
    saved: Saved[]
    isSaved: (atsId: string) => boolean
    toggleSave: (atsId: string, name?: string, company?: string) => void
    saveJob: (atsId: string, name?: string, company?: string) => void
    unsaveJob: (atsId: string) => void
    clearAll: () => void
    isLoading: boolean
}

export interface Applied {
    ats_id: string
    name: string
    company: string
    applied_at: string | null
}

export interface UseAppliedReturn {
    appliedIds: string[]
    applied: Applied[]
    isApplied: (atsId: string) => boolean
    toggleApplied: (atsId: string, name?: string, company?: string) => void
    markApplied: (atsId: string, name?: string, company?: string) => void
    unmarkApplied: (atsId: string) => void
    updateAppliedDate: (atsId: string, appliedAt: string | null) => void
    clearAll: () => void
    isLoading: boolean
}

export interface UseSavedCompaniesReturn {
    savedCompanies: WatchlistItem[]
    savedCompanyNames: string[]
    isSaved: (name: string) => boolean
    toggleSave: (name: string, slug: string) => void
    saveCompany: (name: string, slug: string) => void
    unsaveCompany: (name: string) => void
    clearAll: () => void
    isLoading: boolean
    watchlists: WatchlistMeta[]
    activeListId: string
    setActiveListId: (id: string) => void
    createList: (name: string) => string
    renameList: (id: string, name: string) => void
    deleteList: (id: string) => void
    reorderLists: (ids: string[]) => void
    moveToList: (name: string, toListId: string) => void
    itemsForList: (listId: string) => WatchlistItem[]
    isInList: (name: string, listId: string) => boolean
    addToList: (name: string, slug: string, listId: string) => void
    removeFromList: (name: string, listId: string) => void
    refresh: () => void
}

export interface AtsJobData {
    parquet?: string
    parquet_sha256?: string
    parquet_size_bytes?: number
    rows: number
}

export interface AtsCompanyData {
    parquet?: string
    parquet_sha256?: string
    parquet_size_bytes?: number
    rows: number
}

export interface SchemaDef {
    columns: string[]
}

export interface Manifest {
    all: {
        parquet: string
        rows: number
        parquet_size_bytes: number
        parquet_sha256: string
    }
    ats: {
        parquet: string
        rows: number
        parquet_size_bytes: number
    }
    by_ats: Record<string, AtsJobData>
    by_ats_companies: Record<string, AtsCompanyData>
    companies: {
        parquet: string
        parquet_sha256: string
        parquet_size_bytes: number
        rows: number
    }
    watchlist: {
        parquet: string
        rows: number
        parquet_size_bytes: number
    }
    schemas: {
        ats: SchemaDef
        companies: SchemaDef
        jobs: SchemaDef
        watchlist: SchemaDef
    }
    stats: {
        ats_count: number
        jobs_24h: number
        schema_columns: string[]
        schema_version: string
        total_companies: number
        total_jobs: number
    }
    version: string
    generated_at: string
    updated_at: string
}

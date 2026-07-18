import { useCallback } from 'react'
import { useLocalStorageList } from '@/hooks/use-local-storage-list'
import type { Applied, UseAppliedReturn } from '@/types'

const STORAGE_KEY = 'applied'

function isAppliedItem(item: unknown): item is Applied {
    return typeof item === 'object' && item !== null && 'ats_id' in item && 'name' in item && 'company' in item
}

function normalize(item: unknown): Applied {
    const raw = item as Applied
    return {
        ...raw,
        applied_at: 'applied_at' in raw ? (raw.applied_at ?? null) : null,
    }
}

function readWithNormalization(): Applied[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed.filter(isAppliedItem).map(normalize)
        return []
    } catch {
        return []
    }
}

function writeItems(items: Applied[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
        console.error('Error writing applied jobs:', error)
    }
}

export function useApplied(): UseAppliedReturn {
    const {
        items: applied,
        ids: appliedIds,
        saveOne,
        removeOne,
        clearAll: clearStorage,
        refresh,
    } = useLocalStorageList<Applied>(STORAGE_KEY, isAppliedItem)

    const isApplied = useCallback((atsId: string): boolean => appliedIds.includes(atsId), [appliedIds])

    const markApplied = useCallback(
        (atsId: string, name?: string, company?: string) => {
            if (name && company) {
                saveOne({ ats_id: atsId, name, company, applied_at: new Date().toISOString() })
            } else {
                saveOne({ ats_id: atsId, name: '', company: '', applied_at: new Date().toISOString() })
            }
        },
        [saveOne],
    )

    const unmarkApplied = useCallback((atsId: string) => removeOne(atsId), [removeOne])

    const updateAppliedDate = useCallback(
        (atsId: string, appliedAt: string | null) => {
            const jobs = readWithNormalization()
            const updated = jobs.map((job) => (job.ats_id === atsId ? { ...job, applied_at: appliedAt } : job))
            writeItems(updated)
            refresh()
        },
        [refresh],
    )

    const toggleApplied = useCallback(
        (atsId: string, name?: string, company?: string) => {
            if (isApplied(atsId)) {
                unmarkApplied(atsId)
            } else {
                markApplied(atsId, name, company)
            }
        },
        [isApplied, markApplied, unmarkApplied],
    )

    const clearAll = useCallback(() => {
        clearStorage()
    }, [clearStorage])

    return {
        appliedIds,
        applied,
        isApplied,
        toggleApplied,
        markApplied,
        unmarkApplied,
        updateAppliedDate,
        clearAll,
        isLoading: false,
    }
}

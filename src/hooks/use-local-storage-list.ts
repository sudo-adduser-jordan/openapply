import { useState, useEffect, useCallback } from 'react'

function readList<T>(storageKey: string, validate: (item: unknown) => item is T): T[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(storageKey)
        if (!stored) return []
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed.filter(validate)
        return []
    } catch {
        return []
    }
}

export function useLocalStorageList<T extends { ats_id: string }>(storageKey: string, validate: (item: unknown) => item is T) {
    const [items, setItems] = useState<T[]>(() => {
        if (typeof window !== 'undefined') return readList(storageKey, validate)
        return []
    })

    const ids = items.map((j) => j.ats_id)

    const refresh = useCallback(() => {
        setItems(readList(storageKey, validate))
    }, [storageKey, validate])

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === storageKey) refresh()
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [storageKey, refresh])

    const saveOne = useCallback(
        (item: T) => {
            if (typeof window === 'undefined') return
            try {
                const current = readList(storageKey, validate)
                const map = new Map(current.map((j) => [j.ats_id, j]))
                map.set(item.ats_id, item)
                localStorage.setItem(storageKey, JSON.stringify(Array.from(map.values())))
                refresh()
            } catch (error) {
                console.error(`Error saving to ${storageKey}:`, error)
            }
        },
        [storageKey, validate, refresh],
    )

    const removeOne = useCallback(
        (atsId: string) => {
            if (typeof window === 'undefined') return
            try {
                const current = readList(storageKey, validate)
                const filtered = current.filter((job) => job.ats_id !== atsId)
                localStorage.setItem(storageKey, JSON.stringify(filtered))
                refresh()
            } catch (error) {
                console.error(`Error removing from ${storageKey}:`, error)
            }
        },
        [storageKey, validate, refresh],
    )

    const clearAll = useCallback(() => {
        if (typeof window === 'undefined') return
        try {
            localStorage.removeItem(storageKey)
            refresh()
        } catch (error) {
            console.error(`Error clearing ${storageKey}:`, error)
        }
    }, [storageKey, refresh])

    return { items, ids, saveOne, removeOne, clearAll, refresh }
}

import { useCallback } from 'react'
import { useLocalStorageList } from '@/hooks/use-local-storage-list'
import type { Saved, UseSavedReturn } from '@/types'

const STORAGE_KEY = 'saved'

function isSavedItem(item: unknown): item is Saved {
    return typeof item === 'object' && item !== null && 'ats_id' in item && 'name' in item && 'company' in item
}

export function useSaved(): UseSavedReturn {
    const { items: saved, ids: savedIds, saveOne, removeOne, clearAll: clearStorage } = useLocalStorageList<Saved>(STORAGE_KEY, isSavedItem)

    const isSaved = useCallback((atsId: string): boolean => savedIds.includes(atsId), [savedIds])

    const saveJob = useCallback(
        (atsId: string, name?: string, company?: string) => {
            saveOne({ ats_id: atsId, name: name ?? '', company: company ?? '' })
        },
        [saveOne],
    )

    const unsaveJob = useCallback((atsId: string) => removeOne(atsId), [removeOne])

    const toggleSave = useCallback(
        (atsId: string, name?: string, company?: string) => {
            if (isSaved(atsId)) {
                unsaveJob(atsId)
            } else {
                saveJob(atsId, name, company)
            }
        },
        [isSaved, saveJob, unsaveJob],
    )

    const clearAll = useCallback(() => {
        clearStorage()
    }, [clearStorage])

    return {
        savedIds,
        saved,
        isSaved,
        toggleSave,
        saveJob,
        unsaveJob,
        clearAll,
        isLoading: false,
    }
}

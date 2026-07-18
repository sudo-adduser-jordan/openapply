'use client'

import { useState, useEffect, useCallback } from 'react'
import type { WatchlistMeta, WatchlistItem, UseSavedCompaniesReturn } from '@/types'

const STORAGE_KEY = 'saved-companies'
const ACTIVE_LIST_KEY = 'saved-companies-active-list'

const DEFAULT_LIST_ID = 'default'

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function createDefaultList(): WatchlistMeta {
    return {
        id: DEFAULT_LIST_ID,
        name: 'Default',
        createdAt: new Date().toISOString(),
        sortOrder: 0,
    }
}

function getWatchlistData(): { lists: Record<string, WatchlistMeta>; items: WatchlistItem[] } {
    if (typeof window === 'undefined') return { lists: { [DEFAULT_LIST_ID]: createDefaultList() }, items: [] }
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return { lists: { [DEFAULT_LIST_ID]: createDefaultList() }, items: [] }
        const parsed = JSON.parse(stored)
        if (typeof parsed === 'object' && parsed !== null && 'lists' in parsed && 'items' in parsed) {
            const d = parsed as { lists: unknown; items: unknown }
            if (!d.lists || Object.keys(d.lists as object).length === 0) {
                ;(d as { lists: Record<string, WatchlistMeta>; items: WatchlistItem[] }).lists = {
                    [DEFAULT_LIST_ID]: createDefaultList(),
                }
            }
            return {
                lists: d.lists as Record<string, WatchlistMeta>,
                items: Array.isArray(d.items) ? (d.items as WatchlistItem[]) : [],
            }
        }
        return { lists: { [DEFAULT_LIST_ID]: createDefaultList() }, items: [] }
    } catch {
        return { lists: { [DEFAULT_LIST_ID]: createDefaultList() }, items: [] }
    }
}

function writeData(data: { lists: Record<string, WatchlistMeta>; items: WatchlistItem[] }): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Error writing watchlist data to localStorage:', error)
    }
}

function getSavedCompanies(): WatchlistItem[] {
    return getWatchlistData().items
}

function saveCompanyToStorage(name: string, slug: string): void {
    const data = getWatchlistData()
    const listId = getActiveListId()
    const existing = data.items.find((item) => item.name === name && item.listId === listId)
    if (existing) {
        existing.slug = slug
        existing.savedAt = new Date().toISOString()
        writeData(data)
        return
    }

    data.items.push({
        name,
        slug,
        savedAt: new Date().toISOString(),
        listId,
    })
    writeData(data)
}

function removeCompanyFromStorage(name: string): void {
    const data = getWatchlistData()
    data.items = data.items.filter((item) => item.name !== name)
    writeData(data)
}

function clearAllSavedCompanies(): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Error clearing saved companies from localStorage:', error)
    }
}

function getActiveListId(): string {
    if (typeof window === 'undefined') return DEFAULT_LIST_ID
    try {
        const stored = localStorage.getItem(ACTIVE_LIST_KEY)
        if (stored) {
            const data = getWatchlistData()
            if (data.lists[stored]) return stored
        }
    } catch {}
    return DEFAULT_LIST_ID
}

function setActiveListId(id: string): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(ACTIVE_LIST_KEY, id)
    } catch (error) {
        console.error('Error setting active list:', error)
    }
}

function getWatchlists(): WatchlistMeta[] {
    const data = getWatchlistData()
    return Object.values(data.lists).sort((a, b) => a.sortOrder - b.sortOrder)
}

function createListInStorage(name: string): string {
    const data = getWatchlistData()
    const id = generateId()
    const lists = Object.values(data.lists)
    const maxOrder = lists.length > 0 ? Math.max(...lists.map((l) => l.sortOrder)) : -1
    data.lists[id] = {
        id,
        name,
        createdAt: new Date().toISOString(),
        sortOrder: maxOrder + 1,
    }
    writeData(data)
    return id
}

function renameListInStorage(id: string, name: string): void {
    if (id === DEFAULT_LIST_ID) return
    const data = getWatchlistData()
    if (data.lists[id]) {
        data.lists[id].name = name
        writeData(data)
    }
}

function deleteListInStorage(id: string): void {
    if (id === DEFAULT_LIST_ID) return
    const data = getWatchlistData()
    delete data.lists[id]
    data.items = data.items.filter((item) => item.listId !== id)
    writeData(data)
}

function reorderListsInStorage(ids: string[]): void {
    const data = getWatchlistData()
    ids.forEach((id, index) => {
        if (data.lists[id]) {
            data.lists[id].sortOrder = index
        }
    })
    writeData(data)
}

function addToListInStorage(name: string, slug: string, listId: string): void {
    const data = getWatchlistData()
    if (!data.lists[listId]) return
    const alreadyInList = data.items.some((item) => item.name === name && item.listId === listId)
    if (alreadyInList) return

    data.items.push({
        name,
        slug,
        savedAt: new Date().toISOString(),
        listId,
    })
    writeData(data)
}

function removeFromListInStorage(name: string, listId: string): void {
    const data = getWatchlistData()
    data.items = data.items.filter((item) => !(item.name === name && item.listId === listId))
    writeData(data)
}

function getItemsForList(listId: string): WatchlistItem[] {
    return getWatchlistData().items.filter((item) => item.listId === listId)
}

function isInList(name: string, listId: string): boolean {
    return getWatchlistData().items.some((item) => item.name === name && item.listId === listId)
}

export function useSavedCompanies(): UseSavedCompaniesReturn {
    const [savedCompanies, setSavedCompanies] = useState<WatchlistItem[]>(() => {
        if (typeof window !== 'undefined') return getSavedCompanies()
        return []
    })
    const [savedCompanyNames, setSavedCompanyNames] = useState<string[]>(() => savedCompanies.map((c) => c.name))
    const [watchlists, setWatchlists] = useState<WatchlistMeta[]>(() => {
        if (typeof window !== 'undefined') return getWatchlists()
        return []
    })
    const [activeListId, setActiveListIdState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return getActiveListId()
        }
        return 'default'
    })
    const [isLoading] = useState(false)

    const refresh = useCallback(() => {
        const companies = getSavedCompanies()
        setSavedCompanies(companies)
        setSavedCompanyNames(companies.map((c) => c.name))
        setWatchlists(getWatchlists())
    }, [])

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'saved-companies' || e.key === 'saved-companies-active-list') {
                refresh()
                if (e.key === 'saved-companies-active-list') {
                    setActiveListIdState(getActiveListId())
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [refresh])

    const isSaved = useCallback(
        (name: string): boolean => {
            return savedCompanyNames.includes(name)
        },
        [savedCompanyNames],
    )

    const saveCompany = useCallback(
        (name: string, slug: string) => {
            saveCompanyToStorage(name, slug)
            refresh()
        },
        [refresh],
    )

    const unsaveCompany = useCallback(
        (name: string) => {
            removeCompanyFromStorage(name)
            refresh()
        },
        [refresh],
    )

    const toggleSave = useCallback(
        (name: string, slug: string) => {
            if (isSaved(name)) {
                const inActive = isInList(name, activeListId)
                if (inActive) {
                    removeFromListInStorage(name, activeListId)
                } else {
                    addToListInStorage(name, slug, activeListId)
                }
            } else {
                saveCompanyToStorage(name, slug)
            }
            refresh()
        },
        [isSaved, activeListId, refresh],
    )

    const clearAll = useCallback(() => {
        clearAllSavedCompanies()
        setSavedCompanies([])
        setSavedCompanyNames([])
        setWatchlists(getWatchlists())
    }, [])

    const handleSetActiveListId = useCallback((id: string) => {
        setActiveListId(id)
        setActiveListIdState(id)
    }, [])

    const createList = useCallback(
        (name: string): string => {
            const id = createListInStorage(name)
            refresh()
            return id
        },
        [refresh],
    )

    const renameList = useCallback(
        (id: string, name: string) => {
            renameListInStorage(id, name)
            refresh()
        },
        [refresh],
    )

    const deleteList = useCallback(
        (id: string) => {
            deleteListInStorage(id)
            const currentActive = getActiveListId()
            if (id === currentActive) {
                const defaultId = 'default'
                setActiveListId(defaultId)
                setActiveListIdState(defaultId)
            }
            refresh()
        },
        [refresh],
    )

    const reorderLists = useCallback(
        (ids: string[]) => {
            reorderListsInStorage(ids)
            refresh()
        },
        [refresh],
    )

    const moveToList = useCallback(
        (name: string, toListId: string) => {
            const slug = savedCompanies.find((c) => c.name === name)?.slug ?? ''
            const fromListId = activeListId
            if (fromListId === toListId) return
            const alreadyThere = isInList(name, toListId)
            if (!alreadyThere) {
                addToListInStorage(name, slug, toListId)
            }
            removeFromListInStorage(name, fromListId)
            refresh()
        },
        [activeListId, savedCompanies, refresh],
    )

    const itemsForList = useCallback((listId: string): WatchlistItem[] => {
        return getItemsForList(listId)
    }, [])

    const handleIsInList = useCallback((name: string, listId: string): boolean => {
        return isInList(name, listId)
    }, [])

    const handleAddToList = useCallback(
        (name: string, slug: string, listId: string) => {
            addToListInStorage(name, slug, listId)
            refresh()
        },
        [refresh],
    )

    const handleRemoveFromList = useCallback(
        (name: string, listId: string) => {
            removeFromListInStorage(name, listId)
            refresh()
        },
        [refresh],
    )

    return {
        savedCompanies,
        savedCompanyNames,
        isSaved,
        toggleSave,
        saveCompany,
        unsaveCompany,
        clearAll,
        isLoading,
        watchlists,
        activeListId,
        setActiveListId: handleSetActiveListId,
        createList,
        renameList,
        deleteList,
        reorderLists,
        moveToList,
        itemsForList,
        isInList: handleIsInList,
        addToList: handleAddToList,
        removeFromList: handleRemoveFromList,
        refresh,
    }
}

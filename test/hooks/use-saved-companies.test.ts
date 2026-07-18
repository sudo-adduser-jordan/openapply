import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSavedCompanies } from '@/hooks/use-saved-companies'

const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
        get length() {
            return Object.keys(store).length
        },
        key: (i: number) => Object.keys(store)[i] ?? null,
    }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => {
    localStorageMock.clear()
})

describe('useSavedCompanies', () => {
    it('returns empty state initially', () => {
        const { result } = renderHook(() => useSavedCompanies())
        expect(result.current.savedCompanies).toEqual([])
        expect(result.current.savedCompanyNames).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it('saves a company', () => {
        const { result } = renderHook(() => useSavedCompanies())
        act(() => {
            result.current.saveCompany('Google', 'google')
        })
        expect(result.current.savedCompanies).toHaveLength(1)
        expect(result.current.savedCompanyNames).toEqual(['Google'])
    })

    it('removes a company', () => {
        const { result } = renderHook(() => useSavedCompanies())
        act(() => {
            result.current.saveCompany('Google', 'google')
        })
        act(() => {
            result.current.unsaveCompany('Google')
        })
        expect(result.current.savedCompanies).toHaveLength(0)
    })

    it('toggles save state', () => {
        const { result } = renderHook(() => useSavedCompanies())
        act(() => {
            result.current.toggleSave('Google', 'google')
        })
        expect(result.current.isSaved('Google')).toBe(true)
        act(() => {
            result.current.toggleSave('Google', 'google')
        })
        expect(result.current.isSaved('Google')).toBe(false)
    })

    it('clears all', () => {
        const { result } = renderHook(() => useSavedCompanies())
        act(() => {
            result.current.saveCompany('Google', 'google')
            result.current.saveCompany('Meta', 'meta')
        })
        act(() => {
            result.current.clearAll()
        })
        expect(result.current.savedCompanies).toHaveLength(0)
    })

    it('returns watchlists with default list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        expect(result.current.watchlists).toHaveLength(1)
        expect(result.current.watchlists[0].name).toBe('Default')
        expect(result.current.watchlists[0].id).toBe('default')
    })

    it('creates a new list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        let newId = ''
        act(() => {
            newId = result.current.createList('Dream Companies')
        })
        expect(newId).toBeTruthy()
        expect(result.current.watchlists).toHaveLength(2)
        expect(result.current.watchlists[1].name).toBe('Dream Companies')
    })

    it('renames a list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        let newId = ''
        act(() => {
            newId = result.current.createList('Old Name')
        })
        act(() => {
            result.current.renameList(newId, 'New Name')
        })
        const list = result.current.watchlists.find((l) => l.id === newId)
        expect(list?.name).toBe('New Name')
    })

    it('deletes a list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        let newId = ''
        act(() => {
            newId = result.current.createList('Temp')
        })
        act(() => {
            result.current.deleteList(newId)
        })
        expect(result.current.watchlists).toHaveLength(1)
    })

    it('sets active list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        let newId = ''
        act(() => {
            newId = result.current.createList('Custom')
        })
        act(() => {
            result.current.setActiveListId(newId)
        })
        expect(result.current.activeListId).toBe(newId)
    })

    it('saves to active list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        let newId = ''
        act(() => {
            newId = result.current.createList('Custom')
            result.current.setActiveListId(newId)
            result.current.saveCompany('Google', 'google')
        })
        const items = result.current.itemsForList(newId)
        expect(items).toHaveLength(1)
        expect(items[0].name).toBe('Google')
        expect(result.current.itemsForList('default')).toHaveLength(0)
    })

    it('checks if a company is in a specific list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        act(() => {
            result.current.saveCompany('Google', 'google')
        })
        expect(result.current.isInList('Google', 'default')).toBe(true)
    })

    it('moves a company from active list to another list', () => {
        const { result } = renderHook(() => useSavedCompanies())
        let newId = ''
        act(() => {
            result.current.saveCompany('Google', 'google')
            newId = result.current.createList('Custom')
            result.current.moveToList('Google', newId)
        })
        expect(result.current.itemsForList('default')).toHaveLength(0)
        expect(result.current.itemsForList(newId)).toHaveLength(1)
    })
})

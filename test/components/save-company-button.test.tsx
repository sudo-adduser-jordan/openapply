import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SaveCompanyButton } from '@/components/SaveCompanyButton'

const mockIsSaved = vi.fn()
const mockIsInList = vi.fn()
const mockToggleSave = vi.fn()
const mockCreateList = vi.fn()
const mockAddToList = vi.fn()
const mockRemoveFromList = vi.fn()
const mockSetActiveListId = vi.fn()

vi.mock('@/hooks/use-saved-companies', () => ({
    useSavedCompanies: () => ({
        isSaved: mockIsSaved,
        toggleSave: mockToggleSave,
        savedCompanies: [],
        savedCompanyNames: [],
        saveCompany: vi.fn(),
        unsaveCompany: vi.fn(),
        clearAll: vi.fn(),
        isLoading: false,
        watchlists: [{ id: 'default', name: 'Default', createdAt: '', sortOrder: 0 }],
        activeListId: 'default',
        setActiveListId: mockSetActiveListId,
        createList: mockCreateList,
        renameList: vi.fn(),
        deleteList: vi.fn(),
        reorderLists: vi.fn(),
        moveToList: vi.fn(),
        itemsForList: vi.fn().mockReturnValue([]),
        isInList: mockIsInList,
        addToList: mockAddToList,
        removeFromList: mockRemoveFromList,
    }),
}))

beforeEach(() => {
    mockIsSaved.mockReset()
    mockIsInList.mockReset()
    mockToggleSave.mockReset()
    mockCreateList.mockReset()
    mockAddToList.mockReset()
    mockRemoveFromList.mockReset()
    mockSetActiveListId.mockReset()

    mockIsInList.mockReturnValue(false)
})

describe('SaveCompanyButton', () => {
    it('renders compact variant with "Watch" text when not saved', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveCompanyButton name='Google' slug='google' />)
        expect(screen.getByText('Watch')).toBeInTheDocument()
        expect(screen.getByLabelText('Add to watchlist')).toBeInTheDocument()
    })

    it('renders compact variant with "Watching" when in active list', () => {
        mockIsSaved.mockReturnValue(true)
        mockIsInList.mockReturnValue(true)
        render(<SaveCompanyButton name='Google' slug='google' />)
        expect(screen.getByText('Watching')).toBeInTheDocument()
        expect(screen.getByLabelText('Remove from watchlist')).toBeInTheDocument()
    })

    it('renders compact variant with "Watched" when saved but not in active list', () => {
        mockIsSaved.mockReturnValue(true)
        mockIsInList.mockReturnValue(false)
        render(<SaveCompanyButton name='Google' slug='google' />)
        expect(screen.getByText('Watched')).toBeInTheDocument()
    })

    it('calls toggleSave on click', () => {
        mockIsSaved.mockReturnValue(false)
        mockIsInList.mockReturnValue(false)
        render(<SaveCompanyButton name='Google' slug='google' />)
        fireEvent.click(screen.getByText('Watch'))
        expect(mockToggleSave).toHaveBeenCalledWith('Google', 'google')
    })

    it('renders icon variant', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveCompanyButton name='Google' slug='google' variant='icon' />)
        expect(screen.getByLabelText('Add to watchlist')).toBeInTheDocument()
    })

    it('renders button variant', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveCompanyButton name='Google' slug='google' variant='button' />)
        expect(screen.getByText('Watch')).toBeInTheDocument()
        expect(screen.getByLabelText('Add to watchlist')).toBeInTheDocument()
    })

    it('renders icon variant with "Watching" fill when in active list', () => {
        mockIsSaved.mockReturnValue(true)
        mockIsInList.mockReturnValue(true)
        render(<SaveCompanyButton name='Google' slug='google' variant='icon' />)
        expect(screen.getByLabelText('Remove from watchlist')).toBeInTheDocument()
    })

    it('does not show dropdown when only one list exists', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveCompanyButton name='Google' slug='google' />)
        const dropdownButtons = document.querySelectorAll('[aria-label="Select watchlist"]')
        expect(dropdownButtons.length).toBe(0)
    })
})

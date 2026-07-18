import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WatchlistContent } from '@/components/WatchlistContent'

const mockLoadJobs = vi.fn()
const mockClearAll = vi.fn()
const mockCreateList = vi.fn()
const mockRenameList = vi.fn()
const mockDeleteList = vi.fn()
const mockSetActiveListId = vi.fn()
const mockItemsForList = vi.fn()

const defaultWatchlists = [{ id: 'default', name: 'Default', createdAt: '', sortOrder: 0 }]

vi.mock('@/hooks/use-saved-companies', () => ({
    useSavedCompanies: () => ({
        savedCompanies: [],
        savedCompanyNames: [],
        isSaved: vi.fn().mockReturnValue(false),
        toggleSave: vi.fn(),
        saveCompany: vi.fn(),
        unsaveCompany: vi.fn(),
        clearAll: mockClearAll,
        isLoading: false,
        watchlists: defaultWatchlists,
        activeListId: 'default',
        setActiveListId: mockSetActiveListId,
        createList: mockCreateList,
        renameList: mockRenameList,
        deleteList: mockDeleteList,
        reorderLists: vi.fn(),
        moveToList: vi.fn(),
        itemsForList: mockItemsForList,
        isInList: vi.fn().mockReturnValue(false),
        addToList: vi.fn(),
        removeFromList: vi.fn(),
    }),
}))

beforeEach(() => {
    vi.clearAllMocks()
    mockLoadJobs.mockResolvedValue([])
    mockItemsForList.mockReturnValue([])
    global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
            ok: true,
            json: () => mockLoadJobs().then((jobs: unknown) => ({ jobs })),
        }),
    )
})

describe('WatchlistContent', () => {
    it('renders empty state when no companies', async () => {
        render(<WatchlistContent />)
        await waitFor(() => {
            expect(screen.getByText('No companies in this list')).toBeInTheDocument()
        })
        expect(screen.getByText('Browse Companies')).toBeInTheDocument()
    })

    it('shows company cards when companies exist', async () => {
        mockItemsForList.mockReturnValue([
            { name: 'Google', slug: 'google', savedAt: '2026-01-01T00:00:00Z', listId: 'default' },
            { name: 'Meta', slug: 'meta', savedAt: '2026-01-02T00:00:00Z', listId: 'default' },
        ])
        mockLoadJobs.mockResolvedValue([
            {
                url: 'https://google.com/jobs/1',
                title: 'Engineer',
                location: 'Mountain View',
                company: 'Google',
                ats_id: 'g1',
                id: '1',
                lat: 37.4,
                lng: -122.1,
            },
            {
                url: 'https://meta.com/jobs/1',
                title: 'PM',
                location: 'Menlo Park',
                company: 'Meta',
                ats_id: 'm1',
                id: '2',
                lat: 37.5,
                lng: -122.2,
            },
        ])
        render(<WatchlistContent />)
        await waitFor(() => {
            expect(screen.getByText('Google')).toBeInTheDocument()
        })
        expect(screen.getByText('Meta')).toBeInTheDocument()
        expect(screen.getByText('2 companies in')).toBeInTheDocument()
    })

    it('shows correct company count in stat line', async () => {
        mockItemsForList.mockReturnValue([{ name: 'Google', slug: 'google', savedAt: '2026-01-01T00:00:00Z', listId: 'default' }])
        mockLoadJobs.mockResolvedValue([])
        render(<WatchlistContent />)
        await waitFor(() => {
            expect(screen.getByText('1 company in')).toBeInTheDocument()
        })
    })

    it('calls clearAll when Clear All confirmed', async () => {
        mockItemsForList.mockReturnValue([{ name: 'Google', slug: 'google', savedAt: '2026-01-01T00:00:00Z', listId: 'default' }])
        mockLoadJobs.mockResolvedValue([])
        render(<WatchlistContent />)
        await waitFor(() => {
            const buttons = screen.getAllByText('Clear All')
            fireEvent.click(buttons[0])
        })
        const confirmButtons = screen.getAllByText('Clear All')
        fireEvent.click(confirmButtons[confirmButtons.length - 1])
        expect(mockClearAll).toHaveBeenCalled()
    })

    it('renders list tabs', () => {
        render(<WatchlistContent />)
        expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('shows New List button', () => {
        render(<WatchlistContent />)
        expect(screen.getByText('New List')).toBeInTheDocument()
    })

    it('opens create list input on New List click', () => {
        render(<WatchlistContent />)
        fireEvent.click(screen.getByText('New List'))
        expect(screen.getByPlaceholderText('List name…')).toBeInTheDocument()
    })

    it('creates a list via inline input', () => {
        mockCreateList.mockReturnValue('new-id')
        render(<WatchlistContent />)
        fireEvent.click(screen.getByText('New List'))
        const input = screen.getByPlaceholderText('List name…')
        fireEvent.change(input, { target: { value: 'Dream Companies' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(mockCreateList).toHaveBeenCalledWith('Dream Companies')
    })

    it('shows tabs for multiple lists and allows switching', () => {
        defaultWatchlists.push(
            { id: 'list1', name: 'Dreams', createdAt: '', sortOrder: 1 },
            { id: 'list2', name: 'Active Apps', createdAt: '', sortOrder: 2 },
        )
        mockItemsForList.mockImplementation((id: string) => {
            if (id === 'list1') return [{ name: 'Google', slug: 'google', savedAt: '', listId: 'list1' }]
            return []
        })
        mockLoadJobs.mockResolvedValue([])
        render(<WatchlistContent />)

        expect(screen.getByText('Dreams')).toBeInTheDocument()
        expect(screen.getByText('Active Apps')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Dreams'))
        expect(mockSetActiveListId).toHaveBeenCalledWith('list1')
    })
})

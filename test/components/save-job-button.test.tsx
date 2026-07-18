import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SaveJobButton } from '@/components/SaveJobButton'

const mockIsSaved = vi.fn()
const mockToggleSave = vi.fn()

vi.mock('@/hooks/use-saved', () => ({
    useSaved: () => ({
        isSaved: mockIsSaved,
        toggleSave: mockToggleSave,
        savedIds: [],
        saved: [],
        saveJob: vi.fn(),
        unsaveJob: vi.fn(),
        clearAll: vi.fn(),
        isLoading: false,
    }),
}))

beforeEach(() => {
    mockIsSaved.mockReset()
    mockToggleSave.mockReset()
})

describe('SaveJobButton', () => {
    it('renders compact variant with "Save" text when not saved', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveJobButton atsId='123' name='Engineer' company='Google' />)
        expect(screen.getByText('Save')).toBeInTheDocument()
        expect(screen.getByLabelText('Save job')).toBeInTheDocument()
    })

    it('renders compact variant with "Saved" text when saved', () => {
        mockIsSaved.mockReturnValue(true)
        render(<SaveJobButton atsId='123' name='Engineer' company='Google' />)
        expect(screen.getByText('Saved')).toBeInTheDocument()
        expect(screen.getByLabelText('Unsave job')).toBeInTheDocument()
    })

    it('calls toggleSave on click', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveJobButton atsId='123' name='Engineer' company='Google' />)
        fireEvent.click(screen.getByText('Save'))
        expect(mockToggleSave).toHaveBeenCalledWith('123', 'Engineer', 'Google')
    })

    it('renders icon variant', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveJobButton atsId='123' variant='icon' />)
        expect(screen.getByLabelText('Save job')).toBeInTheDocument()
    })

    it('renders button variant', () => {
        mockIsSaved.mockReturnValue(false)
        render(<SaveJobButton atsId='123' variant='button' />)
        expect(screen.getByText('Save')).toBeInTheDocument()
        expect(screen.getByLabelText('Save job')).toBeInTheDocument()
    })
})

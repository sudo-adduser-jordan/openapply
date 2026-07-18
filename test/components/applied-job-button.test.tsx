import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppliedJobButton } from '@/components/AppliedJobButton'

const mockIsApplied = vi.fn()
const mockToggleApplied = vi.fn()

vi.mock('@/hooks/use-applied', () => ({
    useApplied: () => ({
        isApplied: mockIsApplied,
        toggleApplied: mockToggleApplied,
        appliedIds: [],
        applied: [],
        markApplied: vi.fn(),
        unmarkApplied: vi.fn(),
        updateAppliedDate: vi.fn(),
        clearAll: vi.fn(),
        isLoading: false,
    }),
}))

beforeEach(() => {
    mockIsApplied.mockReset()
    mockToggleApplied.mockReset()
})

describe('AppliedJobButton', () => {
    it('renders compact variant with "Mark Applied" when not applied', () => {
        mockIsApplied.mockReturnValue(false)
        render(<AppliedJobButton atsId='123' name='Engineer' company='Google' />)
        expect(screen.getByText('Mark Applied')).toBeInTheDocument()
        expect(screen.getByLabelText('Mark applied')).toBeInTheDocument()
    })

    it('renders compact variant with "Applied" when applied', () => {
        mockIsApplied.mockReturnValue(true)
        render(<AppliedJobButton atsId='123' name='Engineer' company='Google' />)
        expect(screen.getByText('Applied')).toBeInTheDocument()
        expect(screen.getByLabelText('Unmark applied')).toBeInTheDocument()
    })

    it('calls toggleApplied on click', () => {
        mockIsApplied.mockReturnValue(false)
        render(<AppliedJobButton atsId='123' name='Engineer' company='Google' />)
        fireEvent.click(screen.getByText('Mark Applied'))
        expect(mockToggleApplied).toHaveBeenCalledWith('123', 'Engineer', 'Google')
    })

    it('renders icon variant', () => {
        mockIsApplied.mockReturnValue(false)
        render(<AppliedJobButton atsId='123' variant='icon' />)
        expect(screen.getByLabelText('Mark applied')).toBeInTheDocument()
    })

    it('renders button variant', () => {
        mockIsApplied.mockReturnValue(false)
        render(<AppliedJobButton atsId='123' variant='button' />)
        expect(screen.getByText('Mark Applied')).toBeInTheDocument()
    })
})

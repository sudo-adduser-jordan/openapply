import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchField } from '@/components/SearchField'

describe('SearchField', () => {
    it('renders with initial value', () => {
        render(<SearchField value='hello' onChange={() => {}} />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveValue('hello')
    })

    it('calls onChange when typing', async () => {
        const onChange = vi.fn()
        render(<SearchField value='' onChange={onChange} />)
        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'a')
        expect(onChange).toHaveBeenCalledWith('a')
    })

    it('shows clear button when value is present', () => {
        render(<SearchField value='test' onChange={() => {}} />)
        expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
    })

    it('does not show clear button when value is empty', () => {
        render(<SearchField value='' onChange={() => {}} />)
        expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    })

    it('clears value on clear button click', () => {
        const onChange = vi.fn()
        render(<SearchField value='test' onChange={onChange} />)
        fireEvent.click(screen.getByLabelText('Clear search'))
        expect(onChange).toHaveBeenCalledWith('')
    })

    it('renders with placeholder', () => {
        render(<SearchField value='' onChange={() => {}} placeholder='Search jobs...' />)
        expect(screen.getByPlaceholderText('Search jobs...')).toBeInTheDocument()
    })

    it('disables input when disabled prop is set', () => {
        render(<SearchField value='' onChange={() => {}} disabled />)
        expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('hides clear button when disabled', () => {
        render(<SearchField value='test' onChange={() => {}} disabled />)
        expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    })

    it('calls onKeyDown when key is pressed', () => {
        const onKeyDown = vi.fn()
        render(<SearchField value='' onChange={() => {}} onKeyDown={onKeyDown} />)
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
        expect(onKeyDown).toHaveBeenCalled()
    })
})

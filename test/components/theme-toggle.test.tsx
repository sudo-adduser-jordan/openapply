import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/ThemeToggle'

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
    }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.removeAttribute('data-theme')
})

describe('ThemeToggle', () => {
    it('renders both light and dark buttons', () => {
        render(<ThemeToggle />)
        expect(screen.getByText('Light')).toBeInTheDocument()
        expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    it('defaults to dark theme', () => {
        render(<ThemeToggle />)
        const darkButton = screen.getByText('Dark')
        expect(darkButton).toBeInTheDocument()
    })

    it('switches to light theme on light button click', () => {
        render(<ThemeToggle />)
        fireEvent.click(screen.getByText('Light'))
        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        expect(localStorage.getItem('theme')).toBe('light')
    })

    it('switches to dark theme on dark button click', () => {
        render(<ThemeToggle />)
        fireEvent.click(screen.getByText('Light'))
        fireEvent.click(screen.getByText('Dark'))
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(localStorage.getItem('theme')).toBe('dark')
    })
})

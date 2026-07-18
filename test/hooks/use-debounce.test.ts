import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('useDebounce', () => {
    it('returns initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 300))
        expect(result.current).toBe('hello')
    })

    it('does not update before the delay', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'hello', delay: 300 },
        })
        rerender({ value: 'world', delay: 300 })
        expect(result.current).toBe('hello')
    })

    it('updates after the delay', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'hello', delay: 300 },
        })
        rerender({ value: 'world', delay: 300 })
        act(() => {
            vi.advanceTimersByTime(300)
        })
        expect(result.current).toBe('world')
    })

    it('cancels previous timeout on rapid changes', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'a', delay: 300 },
        })
        rerender({ value: 'b', delay: 300 })
        act(() => {
            vi.advanceTimersByTime(100)
        })
        rerender({ value: 'c', delay: 300 })
        act(() => {
            vi.advanceTimersByTime(300)
        })
        expect(result.current).toBe('c')
    })

    it('uses default delay of 300ms', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
            initialProps: { value: 'first' },
        })
        rerender({ value: 'second' })
        act(() => {
            vi.advanceTimersByTime(299)
        })
        expect(result.current).toBe('first')
        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(result.current).toBe('second')
    })

    it('cleans up timeout on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
        const { unmount } = renderHook(() => useDebounce('test', 300))
        unmount()
        expect(clearTimeoutSpy).toHaveBeenCalled()
        clearTimeoutSpy.mockRestore()
    })
})

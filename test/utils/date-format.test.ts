import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { formatJobDate, getJobDate } from '@/utils/format'
import type { JobMarker } from '@/types'

const baseJob: JobMarker = {
    url: 'https://example.com/job',
    title: 'Software Engineer',
    location: 'Remote',
    company: 'Acme',
    ats_id: '123',
    id: '456',
    lat: 0,
    lng: 0,
}

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('formatJobDate', () => {
    it('returns null when posted_at is missing', () => {
        expect(formatJobDate({ ...baseJob, posted_at: undefined })).toBeNull()
        expect(formatJobDate({ ...baseJob, posted_at: null })).toBeNull()
    })

    it('returns null for invalid date strings', () => {
        expect(formatJobDate({ ...baseJob, posted_at: 'not-a-date' })).toBeNull()
    })

    it('returns "New" for today', () => {
        const today = new Date()
        vi.setSystemTime(today)
        const job = { ...baseJob, posted_at: today.toISOString() }
        expect(formatJobDate(job)).toBe('New')
    })

    it('returns "New" for yesterday', () => {
        const today = new Date()
        vi.setSystemTime(today)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const job = { ...baseJob, posted_at: yesterday.toISOString() }
        expect(formatJobDate(job)).toBe('New')
    })

    it('returns "2d" for 2 days ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2026-07-02')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('2d')
    })

    it('returns "6d" for 6 days ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2026-06-28')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('6d')
    })

    it('returns "1w" for 7 days ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2026-06-27')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('1w')
    })

    it('returns "4w" for 28 days ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2026-06-06')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('4w')
    })

    it('returns "4w" for 30 days ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2026-06-04')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('4w')
    })

    it('returns "11m" for 330 days ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2025-08-08')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('11m')
    })

    it('returns "+1y" for 12+ months ago', () => {
        const today = new Date('2026-07-04')
        vi.setSystemTime(today)
        const date = new Date('2025-06-01')
        const job = { ...baseJob, posted_at: date.toISOString() }
        expect(formatJobDate(job)).toBe('+1y')
    })
})

describe('getJobDate', () => {
    it('returns null when posted_at is missing', () => {
        expect(getJobDate({ ...baseJob, posted_at: undefined })).toBeNull()
        expect(getJobDate({ ...baseJob, posted_at: null })).toBeNull()
    })

    it('returns null for invalid date strings', () => {
        expect(getJobDate({ ...baseJob, posted_at: 'bad' })).toBeNull()
    })

    it('returns a Date for valid posted_at', () => {
        const dateStr = '2026-07-01T00:00:00Z'
        const result = getJobDate({ ...baseJob, posted_at: dateStr })
        expect(result).toBeInstanceOf(Date)
        expect(result!.toISOString()).toBe(new Date(dateStr).toISOString())
    })
})

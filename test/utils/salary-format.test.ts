import { describe, it, expect } from 'vitest'
import { formatSalaryString, formatSalary, formatExperience } from '@/utils/format'
import type { JobMarker } from '@/types'

describe('formatSalaryString', () => {
    it('returns empty string for empty input', () => {
        expect(formatSalaryString('')).toBe('')
    })

    it('formats range with currency symbols on both sides', () => {
        expect(formatSalaryString('$200,000-$300,000')).toBe('$200K - $300K')
    })

    it('formats range with currency symbol only at start', () => {
        expect(formatSalaryString('$140000-170000')).toBe('$140K - $170K')
    })

    it('formats range with spaces around dash', () => {
        expect(formatSalaryString('$200,000 - $300,000')).toBe('$200K - $300K')
    })

    it('formats range with en-dash', () => {
        expect(formatSalaryString('$145,000–$175,000')).toBe('$145K - $175K')
    })

    it('formats single salary value', () => {
        expect(formatSalaryString('$130900')).toBe('$131K')
    })

    it('formats single salary value with commas', () => {
        expect(formatSalaryString('$130,900')).toBe('$131K')
    })

    it('formats dict format salary', () => {
        const result = formatSalaryString("{'unit': 'USD', 'amount': '140900.0'}")
        expect(result).toBe('$141K')
    })

    it('formats dict format with double quotes', () => {
        const result = formatSalaryString('{"unit": "USD", "amount": "140900.0"}')
        expect(result).toBe('$141K')
    })

    it('returns input unchanged for unparseable strings', () => {
        expect(formatSalaryString('Competitive')).toBe('Competitive')
    })

    it('formats EUR salary range', () => {
        expect(formatSalaryString('€100000-150000')).toBe('€100K - €150K')
    })

    it('formats GBP salary range', () => {
        expect(formatSalaryString('£100000-150000')).toBe('£100K - £150K')
    })

    it('formats single EUR salary', () => {
        expect(formatSalaryString('€100000')).toBe('€100K')
    })
})

describe('formatSalary', () => {
    it('returns null when salary_summary is missing', () => {
        const job: JobMarker = {
            url: '',
            title: '',
            location: '',
            company: '',
            ats_id: '',
            id: '',
            lat: 0,
            lng: 0,
        }
        expect(formatSalary(job)).toBeNull()
    })

    it('formats salary_summary', () => {
        const job: JobMarker = {
            url: '',
            title: '',
            location: '',
            company: '',
            ats_id: '',
            id: '',
            lat: 0,
            lng: 0,
            salary_summary: '$200,000-$300,000',
        }
        expect(formatSalary(job)).toBe('$200K - $300K')
    })
})

describe('formatExperience', () => {
    it('returns null for null/undefined/empty', () => {
        expect(formatExperience(null)).toBeNull()
        expect(formatExperience(undefined)).toBeNull()
        expect(formatExperience('')).toBeNull()
    })

    it('extracts first number from range format', () => {
        expect(formatExperience('3-5 years')).toBe('3+ y')
    })

    it('extracts first number from single value', () => {
        expect(formatExperience('5 years')).toBe('5+ y')
    })

    it('returns null for strings with no numbers', () => {
        expect(formatExperience('Entry level')).toBeNull()
    })
})

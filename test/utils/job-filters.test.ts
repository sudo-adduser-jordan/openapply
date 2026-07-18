import { describe, it, expect } from 'vitest'
import { isRemoteJob, matchesExperienceLevel } from '@/utils/job-filters'
import { EMPTY_FILTERS, countActiveFilters } from '@/components/FilterDialog'
import type { JobMarker } from '@/types'

const baseJob: JobMarker = {
    url: '',
    title: '',
    location: '',
    company: '',
    ats_id: '',
    id: '',
    lat: 0,
    lng: 0,
}

describe('isRemoteJob', () => {
    it('returns true for "Remote"', () => {
        expect(isRemoteJob({ location: 'Remote' })).toBe(true)
    })

    it('returns true for "Remote - US"', () => {
        expect(isRemoteJob({ location: 'Remote - US' })).toBe(true)
    })

    it('returns true for "San Francisco, CA (Remote)"', () => {
        expect(isRemoteJob({ location: 'San Francisco, CA (Remote)' })).toBe(true)
    })

    it('returns false for "San Francisco, CA"', () => {
        expect(isRemoteJob({ location: 'San Francisco, CA' })).toBe(false)
    })

    it('returns false for null/undefined location', () => {
        expect(isRemoteJob({ location: null })).toBe(false)
        expect(isRemoteJob({ location: undefined })).toBe(false)
    })

    it('is case insensitive', () => {
        expect(isRemoteJob({ location: 'remote' })).toBe(true)
        expect(isRemoteJob({ location: 'REMOTE' })).toBe(true)
    })
})

describe('matchesExperienceLevel', () => {
    it('returns false when no experience data', () => {
        expect(matchesExperienceLevel(baseJob, 'entry')).toBe(false)
    })

    it('matches entry level (<=2 years)', () => {
        expect(matchesExperienceLevel({ ...baseJob, experience: '0-2 years' }, 'entry')).toBe(true)
        expect(matchesExperienceLevel({ ...baseJob, experience: '2 years' }, 'entry')).toBe(true)
        expect(matchesExperienceLevel({ ...baseJob, experience: '3 years' }, 'entry')).toBe(false)
    })

    it('matches mid level (3-5 years)', () => {
        expect(matchesExperienceLevel({ ...baseJob, experience: '3-5 years' }, 'mid')).toBe(true)
        expect(matchesExperienceLevel({ ...baseJob, experience: '2 years' }, 'mid')).toBe(false)
        expect(matchesExperienceLevel({ ...baseJob, experience: '6 years' }, 'mid')).toBe(false)
    })

    it('matches senior level (>=6 years)', () => {
        expect(matchesExperienceLevel({ ...baseJob, experience: '6-10 years' }, 'senior')).toBe(true)
        expect(matchesExperienceLevel({ ...baseJob, experience: '5 years' }, 'senior')).toBe(false)
    })
})

describe('countActiveFilters', () => {
    it('returns 0 for empty filters', () => {
        expect(countActiveFilters(EMPTY_FILTERS)).toBe(0)
    })

    it('counts companies', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, companies: ['Google', 'Meta'] })).toBe(2)
    })

    it('counts excludeCompanies', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, excludeCompanies: ['Amazon'] })).toBe(1)
    })

    it('counts locations', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, locations: ['Remote'] })).toBe(1)
    })

    it('counts search text', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, searchText: 'engineer' })).toBe(1)
    })

    it('counts postedWithin', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, postedWithin: 7 })).toBe(1)
    })

    it('counts remoteOnly', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, remoteOnly: true })).toBe(1)
    })

    it('counts minSalary', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, minSalary: 100000 })).toBe(1)
    })

    it('counts experience', () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, experience: 'senior' })).toBe(1)
    })

    it('counts multiple active filters', () => {
        const filters = {
            ...EMPTY_FILTERS,
            companies: ['Google'],
            remoteOnly: true,
            minSalary: 100000,
        }
        expect(countActiveFilters(filters)).toBe(3)
    })
})

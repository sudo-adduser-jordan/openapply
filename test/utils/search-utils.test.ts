import { describe, it, expect } from 'vitest'
import { matchesSearchTerm } from '@/utils/search'

describe('matchesSearchTerm', () => {
    it('returns true for empty term', () => {
        expect(matchesSearchTerm('Software Engineer', '')).toBe(true)
    })

    it('matches exact token', () => {
        expect(matchesSearchTerm('Software Engineer', 'software')).toBe(true)
    })

    it('is case insensitive', () => {
        expect(matchesSearchTerm('Software Engineer', 'SOFTWARE')).toBe(true)
    })

    it('matches plural variants', () => {
        expect(matchesSearchTerm('Software Engineers', 'engineer')).toBe(true)
        expect(matchesSearchTerm('Software Engineer', 'engineers')).toBe(true)
    })

    it('matches suffix variants for long terms', () => {
        expect(matchesSearchTerm('Software Developer', 'develop')).toBe(true)
        expect(matchesSearchTerm('Software Developing', 'develop')).toBe(true)
    })

    it('supports fuzzy matching option', () => {
        expect(matchesSearchTerm('Software Developer', 'Developr', { fuzzy: true })).toBe(true)
    })

    it('does not fuzzy match short terms', () => {
        expect(matchesSearchTerm('Software', 'soft', { fuzzy: true })).toBe(false)
    })

    it('requires all tokens for multi-token terms', () => {
        expect(matchesSearchTerm('Software Engineer', 'software engineer')).toBe(true)
        expect(matchesSearchTerm('Software Developer', 'software engineer')).toBe(false)
    })
})

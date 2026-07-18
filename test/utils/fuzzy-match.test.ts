import { describe, it, expect } from 'vitest'
import { fuzzyMatch } from '@/utils/fuzzy-match'

describe('fuzzyMatch', () => {
    it('returns true for exact match', () => {
        expect(fuzzyMatch('Software Engineer', 'Software Engineer')).toBe(true)
    })

    it('is case insensitive', () => {
        expect(fuzzyMatch('OpenAI', 'openai')).toBe(true)
    })

    it('matches word boundary', () => {
        expect(fuzzyMatch('Senior Software Engineer', 'Engineer')).toBe(true)
    })

    it('matches substring for queries >= 3 chars', () => {
        expect(fuzzyMatch('Senior Software Engineer', 'Soft')).toBe(true)
    })

    it('matches short substrings (1-2 chars) via exact substring', () => {
        expect(fuzzyMatch('David AI', 'ai')).toBe(true)
    })

    it('matches fuzzy similar words', () => {
        expect(fuzzyMatch('Developer', 'Developr', 0.6)).toBe(true)
    })

    it('returns false for unrelated words', () => {
        expect(fuzzyMatch('Software Engineer', 'Marketing')).toBe(false)
    })

    it('matches multi-word query with AND logic', () => {
        expect(fuzzyMatch('Senior Software Engineer', 'Senior Engineer')).toBe(true)
    })

    it('returns false when not all multi-word terms match', () => {
        expect(fuzzyMatch('Senior Software Engineer', 'Senior Marketing')).toBe(false)
    })

    it('trims whitespace', () => {
        expect(fuzzyMatch('  Engineer  ', 'engineer')).toBe(true)
    })

    it('matches partial word for queries >= 4 chars', () => {
        expect(fuzzyMatch('openai inc', 'openai')).toBe(true)
    })

    it('respects custom threshold', () => {
        expect(fuzzyMatch('hello', 'hallo', 0.6)).toBe(true)
        expect(fuzzyMatch('hello', 'hallo', 0.9)).toBe(false)
    })

    it('handles empty strings', () => {
        expect(fuzzyMatch('', '')).toBe(true)
        expect(fuzzyMatch('hello', '')).toBe(true)
        expect(fuzzyMatch('', 'hello')).toBe(false)
    })
})

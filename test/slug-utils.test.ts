import { describe, it, expect } from 'vitest'
import { slugify, generateCompanySlug } from '@/utils/format'

describe('slugify', () => {
    it('converts to lowercase', () => {
        expect(slugify('Software Engineer')).toBe('software-engineer')
    })

    it('removes special characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world')
    })

    it('replaces spaces with hyphens', () => {
        expect(slugify('hello world foo')).toBe('hello-world-foo')
    })

    it('trims leading/trailing hyphens', () => {
        expect(slugify('  -hello-  ')).toBe('hello')
    })

    it('handles underscores', () => {
        expect(slugify('hello_world')).toBe('hello-world')
    })
})

describe('generateCompanySlug', () => {
    it('generates slug from company name', () => {
        expect(generateCompanySlug('Google LLC')).toBe('google-llc')
        expect(generateCompanySlug('Meta')).toBe('meta')
    })
})

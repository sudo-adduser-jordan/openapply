import { describe, it, expect } from 'vitest'
import { addUtmParams } from '@/utils/format'

describe('addUtmParams', () => {
    it('adds default UTM params', () => {
        const result = addUtmParams('https://example.com/job/123')
        expect(result).toBe('https://example.com/job/123?utm_source=stapply&utm_medium=job_board&utm_campaign=job_listing')
    })

    it('appends to existing query params', () => {
        const result = addUtmParams('https://example.com/job/123?ref=home')
        expect(result).toContain('ref=home')
        expect(result).toContain('utm_source=stapply')
    })

    it('does not overwrite existing UTM params', () => {
        const result = addUtmParams('https://example.com/job/123?utm_source=custom')
        expect(result).toBe('https://example.com/job/123?utm_source=custom&utm_medium=job_board&utm_campaign=job_listing')
    })

    it('normalizes amazon URLs before adding UTM params', () => {
        const result = addUtmParams('https://amazon.com/jobs/123')
        expect(result).toContain('amazon.jobs')
        expect(result).toContain('utm_source=stapply')
    })

    it('returns the original URL if it is invalid', () => {
        expect(addUtmParams('not-a-url')).toBe('not-a-url')
    })

    it('accepts custom source/medium/campaign', () => {
        const result = addUtmParams('https://example.com/job/123', 'linkedin', 'social', 'apply')
        expect(result).toBe('https://example.com/job/123?utm_source=linkedin&utm_medium=social&utm_campaign=apply')
    })
})

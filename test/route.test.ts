import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetchJobs = vi.hoisted(() => vi.fn())

vi.mock('@/utils/jobs', () => ({
    fetchJobs: mockFetchJobs,
}))

import { GET } from '@/app/api/jobs/route'

function createRequest(url: string) {
    return new Request(url) as unknown as Parameters<typeof GET>[0]
}

beforeEach(() => {
    mockFetchJobs.mockReset()
})

describe('GET /api/jobs', () => {
    it('returns jobs from fetchJobs', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [{ id: '1' }], total: 1 })
        const response = await GET(createRequest('http://localhost/api/jobs'))
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body).toEqual({ jobs: [{ id: '1' }], total: 1 })
    })

    it('passes company filter', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?company=Google'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ company: 'Google' }))
    })

    it('passes ats_type filter', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?ats_type=lever'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ atsType: 'lever' }))
    })

    it('passes search filter', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?search=engineer'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ search: 'engineer' }))
    })

    it('passes location filter', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?location=Remote'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ location: 'Remote' }))
    })

    it('passes is_remote filter', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?is_remote=true'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ isRemote: true }))
    })

    it('passes is_remote=false filter', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?is_remote=false'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ isRemote: false }))
    })

    it('passes page and limit', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?page=2&limit=50'))
        expect(mockFetchJobs).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 50 }))
    })

    it('calls with empty filters when no params', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs'))
        expect(mockFetchJobs).toHaveBeenCalledWith({})
    })

    it('combines multiple filters', async () => {
        mockFetchJobs.mockResolvedValue({ jobs: [], total: 0 })
        await GET(createRequest('http://localhost/api/jobs?company=Google&search=engineer&is_remote=true'))
        expect(mockFetchJobs).toHaveBeenCalledWith({
            company: 'Google',
            search: 'engineer',
            isRemote: true,
        })
    })
})

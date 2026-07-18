import { NextRequest, NextResponse } from 'next/server'
import { fetchJobs } from '@/utils/jobs'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const filters: {
        company?: string
        atsType?: string
        search?: string
        location?: string
        isRemote?: boolean
        page?: number
        limit?: number
    } = {}

    const company = searchParams.get('company')
    if (company) filters.company = company

    const atsType = searchParams.get('ats_type')
    if (atsType) filters.atsType = atsType

    const search = searchParams.get('search')
    if (search) filters.search = search

    const location = searchParams.get('location')
    if (location) filters.location = location

    const isRemote = searchParams.get('is_remote')
    if (isRemote === 'true') filters.isRemote = true
    else if (isRemote === 'false') filters.isRemote = false

    const page = searchParams.get('page')
    if (page) filters.page = parseInt(page, 10)

    const limit = searchParams.get('limit')
    if (limit) filters.limit = parseInt(limit, 10)

    const result = await fetchJobs(filters)
    return NextResponse.json(result)
}

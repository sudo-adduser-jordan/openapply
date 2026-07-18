import { NextResponse } from 'next/server'
import { fetchCompanies } from '@/utils/jobs'

export async function GET() {
    const companies = await fetchCompanies()
    return NextResponse.json(companies)
}

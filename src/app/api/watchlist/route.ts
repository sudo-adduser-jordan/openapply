import { NextResponse } from 'next/server'
import { fetchWatchlistCategories } from '@/utils/watchlist'

export async function GET() {
    const categories = await fetchWatchlistCategories()
    const allCompanies = categories.flatMap((c) => c.companies)
    const seen = new Map<string, { name: string; slug: string }>()
    for (const c of allCompanies) {
        if (!seen.has(c.name)) seen.set(c.name, { name: c.name, slug: c.slug })
    }
    return NextResponse.json({ companies: Array.from(seen.values()), categories })
}

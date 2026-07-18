import { NextResponse } from 'next/server'
import { fetchManifest } from '@/utils/manifest'

export async function GET() {
    const m = await fetchManifest()
    return NextResponse.json(m.stats)
}

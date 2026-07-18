'use client'

import { useEffect, useState } from 'react'
import type { CompanyWithMetadata } from '@/types'
import { CompaniesList } from './CompaniesList'

function LoadingCompanies() {
    return (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 9 }).map((_, i) => (
                <div
                    key={i}
                    className='h-[84px] animate-pulse rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--fg)_2.5%,transparent)]'
                />
            ))}
        </div>
    )
}

export function CompaniesListClient() {
    const [companies, setCompanies] = useState<CompanyWithMetadata[] | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch('/api/companies')
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) setCompanies(data)
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (error) {
        throw new Error('Failed to load companies')
    }

    if (!companies) return <LoadingCompanies />
    return <CompaniesList companies={companies} />
}

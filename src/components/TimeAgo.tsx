'use client'

import { useEffect, useState } from 'react'

function calcAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
}

export function TimeAgo({ iso }: { iso: string }) {
    const [ago, setAgo] = useState<string | null>(null)
    useEffect(() => {
        const update = () => setAgo(calcAgo(iso))
        update()
        const id = setInterval(update, 60000)
        return () => clearInterval(id)
    }, [iso])
    return <>{ago ?? ''}</>
}

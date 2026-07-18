'use client'

import { useApplied } from '@/hooks/use-applied'
import { JobActionButton } from './JobActionButton'

interface AppliedJobButtonProps {
    atsId: string
    name?: string
    company?: string
    variant?: 'icon' | 'button' | 'compact'
    className?: string
}

export function AppliedJobButton({ atsId, name, company, variant, className }: AppliedJobButtonProps) {
    const { isApplied, toggleApplied } = useApplied()
    return (
        <JobActionButton
            variant={variant}
            className={className}
            mode='apply'
            active={isApplied(atsId)}
            onToggle={() => toggleApplied(atsId, name, company)}
        />
    )
}

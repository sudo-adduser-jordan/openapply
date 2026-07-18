'use client'

import { useSaved } from '@/hooks/use-saved'
import { JobActionButton } from './JobActionButton'

interface SaveJobButtonProps {
    atsId: string
    name?: string
    company?: string
    variant?: 'icon' | 'button' | 'compact'
    className?: string
}

export function SaveJobButton({ atsId, name, company, variant, className }: SaveJobButtonProps) {
    const { isSaved, toggleSave } = useSaved()
    return (
        <JobActionButton
            variant={variant}
            className={className}
            mode='save'
            active={isSaved(atsId)}
            onToggle={() => toggleSave(atsId, name, company)}
        />
    )
}

'use client'

import clsx from 'clsx'
import { Bookmark, Checkmark } from './icons'

interface JobActionButtonProps {
    variant?: 'icon' | 'button' | 'compact'
    className?: string
    mode: 'save' | 'apply'
    active: boolean
    onToggle: () => void
}

const cfg = {
    save: {
        activeColor: 'text-blue-400 hover:text-blue-300',
        activeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/40',
        inactiveBg:
            'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] hover:border-[var(--line-strong)]',
        label: { active: 'Saved', inactive: 'Save' },
        ariaLabel: { active: 'Unsave job', inactive: 'Save job' },
        icon: Bookmark,
        fillActive: true,
    },
    apply: {
        activeColor: 'text-emerald-400 hover:text-emerald-300',
        activeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-500/40',
        inactiveBg:
            'bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] text-[var(--ink-mute)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_12%,transparent)] hover:border-[var(--line-strong)]',
        label: { active: 'Applied', inactive: 'Mark Applied' },
        ariaLabel: { active: 'Unmark applied', inactive: 'Mark applied' },
        icon: Checkmark,
        fillActive: false,
    },
}

export function JobActionButton({ variant = 'compact', className, mode, active, onToggle }: JobActionButtonProps) {
    const c = cfg[mode]

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                className={clsx(
                    'transition-colors duration-200',
                    active ? c.activeColor : 'text-[var(--ink-mute)] hover:text-[var(--ink-soft)]',
                    className,
                )}
                aria-label={active ? c.ariaLabel.active : c.ariaLabel.inactive}
                title={active ? c.ariaLabel.active : c.ariaLabel.inactive}
            >
                <c.icon
                    width={14}
                    height={14}
                    fill={active && c.fillActive ? 'currentColor' : 'none'}
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </button>
        )
    }

    if (variant === 'button') {
        return (
            <button
                onClick={handleClick}
                className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium',
                    'border transition-[border-color,background-color] duration-200 ease-in-out',
                    active ? c.activeBg : c.inactiveBg,
                    className,
                )}
                aria-label={active ? c.ariaLabel.active : c.ariaLabel.inactive}
            >
                <c.icon
                    width={14}
                    height={14}
                    fill={active && c.fillActive ? 'currentColor' : 'none'}
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
                {active ? c.label.active : c.label.inactive}
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            className={clsx(
                'inline-flex items-center gap-1 px-[10px] py-0.5 rounded-full text-[11px] md:text-[12px] font-medium',
                'border transition-[border-color,background-color] duration-200 ease-in-out',
                active ? c.activeBg : c.inactiveBg,
                className,
            )}
            aria-label={active ? c.ariaLabel.active : c.ariaLabel.inactive}
        >
            <c.icon
                    width={10}
                    height={10}
                    className='md:w-[11px] md:h-[11px]'
                    fill={active && c.fillActive ? 'currentColor' : 'none'}
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            {active ? c.label.active : c.label.inactive}
        </button>
    )
}

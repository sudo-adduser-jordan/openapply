'use client'

import { useCallback, useState, useEffect } from 'react'
import clsx from 'clsx'
import { SunIcon, MoonIcon } from './icons'

const tab = (active: boolean) =>
    clsx(
        'flex cursor-pointer items-center gap-1.5 px-3 py-1 text-[12px] font-medium transition-colors',
        active ? 'text-[var(--violet-deep)]' : 'text-[var(--ink-mute)] hover:text-[var(--ink)]',
    )

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        const t = document.documentElement.getAttribute('data-theme')
        if (t === 'light' || t === 'dark') setTheme(t)
    }, [])

    const select = useCallback(
        (next: 'light' | 'dark') => {
            if (next === theme) return
            setTheme(next)
            document.documentElement.setAttribute('data-theme', next)
            try {
                localStorage.setItem('theme', next)
            } catch {
                /* localStorage may be unavailable */
            }
        },
        [theme],
    )

    return (
        <div className='inline-flex items-center rounded-[var(--radius-pill)] border-2 border-dotted border-[var(--line-strong)] bg-[var(--paper-3)]'>
            <button onClick={() => select('light')} className={tab(theme === 'light')}>
                <SunIcon width={13} height={13} />
                Light
            </button>
            <span className='h-4 w-px bg-[var(--line-strong)]' />
            <button onClick={() => select('dark')} className={tab(theme === 'dark')}>
                <MoonIcon width={13} height={13} />
                Dark
            </button>
        </div>
    )
}

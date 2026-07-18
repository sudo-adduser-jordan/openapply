'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { OpenApplyLockup } from './OpenApplyLogo'
import { IconNavLinks, MOBILE_NAV_ITEMS } from './IconNavLinks'
import { XIcon, MenuIcon } from './icons'

interface PageHeaderProps {
    rightAction?: React.ReactNode
    /** Show the icon-nav (Companies / Jobs / Map / GitHub) on the right. Default true. */
    showNav?: boolean
}

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

/* Page chrome — 1:1 with the landing/viewer HeaderIconNav, in the design
 * system's dark palette. The logo links home. */
export function PageHeader({ rightAction, showNav = true }: PageHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const closeMenu = useCallback(() => setMenuOpen(false), [])

    useEffect(() => {
        if (!menuOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMenu()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [menuOpen, closeMenu])

    return (
        <header className='lab-header sticky top-0 z-50 bg-[color:var(--shell)]/90 backdrop-blur-md px-6 py-3.5 border-b-2 border-dotted border-[color:var(--line-strong)]'>
            <div className='flex items-center justify-between gap-6'>
                <Link
                    href='/'
                    aria-label='OpenApply home'
                    className='inline-flex items-center rounded-md transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]'
                >
                    <OpenApplyLockup size={20} />
                </Link>
                <div className='flex items-center gap-1'>
                    {rightAction && <div className='mr-2'>{rightAction}</div>}
                    {showNav && (
                        <nav className='hidden md:flex items-center gap-1'>
                            <IconNavLinks />
                        </nav>
                    )}
                    {showNav && (
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className='md:hidden inline-flex items-center justify-center size-9 rounded-md text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--paper-3)] transition-colors'
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? (
                                <XIcon width={20} height={20} />
                            ) : (
                                <MenuIcon width={20} height={20} />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {menuOpen && showNav && (
                <>
                    <div className='fixed inset-0 z-40 bg-black/40 md:hidden' onClick={closeMenu} aria-hidden='true' />
                    <div
                        ref={menuRef}
                        className='fixed top-[57px] left-0 right-0 z-50 md:hidden bg-[var(--shell)] border-b-2 border-dotted border-[var(--line-strong)] px-4 py-4 shadow-xl'
                    >
                        <nav className='flex flex-col gap-1'>
                            {MOBILE_NAV_ITEMS.map((item) => {
                                const linkClass = cn(
                                    'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
                                    'text-[var(--ink-soft)] hover:bg-[var(--paper-3)] hover:text-[var(--ink)]',
                                )
                                const inner = (
                                    <>
                                        <item.icon className={cn('size-5', item.iconClass)} />
                                        {item.label}
                                    </>
                                )
                                return item.internal ? (
                                    <Link key={item.label} href={item.href} className={linkClass} onClick={closeMenu}>
                                        {inner}
                                    </Link>
                                ) : (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={linkClass}
                                        onClick={closeMenu}
                                    >
                                        {inner}
                                    </a>
                                )
                            })}
                        </nav>
                    </div>
                </>
            )}
        </header>
    )
}

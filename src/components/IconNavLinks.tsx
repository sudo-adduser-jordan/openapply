import Link from 'next/link'
import { Checkmark, Bookmark, GithubIcon, Database } from './icons'

const SITE = {
    name: 'OpenApply',
    dataUrl: '/manifest',
    githubMapUrl: 'https://github.com/sudo-adduser-jordan/openapply',
} as const

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

type NavItem = {
    label: string
    href: string
    internal: boolean
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
    iconClass?: string
    hoverClass?: string
}

const VIOLET_ITEM = {
    iconClass: 'text-[color:var(--violet)] transition-colors group-hover:text-[color:var(--violet-deep)]',
    hoverClass: 'hover:bg-[color:var(--violet-tint)] hover:text-[color:var(--violet-deep)]',
}
const INK_ITEM = {
    iconClass: 'text-[color:var(--ink)]',
    hoverClass: 'hover:bg-[color:var(--paper-3)] hover:text-[color:var(--ink)]',
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Jobs',
        href: '/jobs',
        internal: true,
        hoverClass: 'hover:bg-[color:var(--emerald-tint)] hover:text-[color:var(--emerald-deep)]',
    },
    {
        label: 'Companies',
        href: '/companies',
        internal: true,
        hoverClass: 'hover:bg-[color:var(--violet-tint)] hover:text-[color:var(--violet-deep)]',
    },
    {
        label: 'Watchlists',
        href: '/watchlist',
        internal: true,
        hoverClass: 'hover:bg-[color:var(--violet-tint)] hover:text-[color:var(--violet-deep)]',
    },
    {
        label: 'Applications',
        href: '/applied',
        internal: true,
        icon: Checkmark,
        iconClass: 'text-[color:var(--emerald)] transition-colors group-hover:text-[color:var(--emerald-deep)]',
        hoverClass: 'hover:bg-[color:var(--emerald-tint)] hover:text-[color:var(--emerald-deep)]',
    },
    {
        label: 'Saved',
        href: '/saved',
        internal: true,
        icon: Bookmark,
        iconClass: 'text-[color:var(--brand)] transition-colors group-hover:text-[color:var(--brand-deep)]',
        hoverClass: 'hover:bg-[color:var(--brand-tint)] hover:text-[color:var(--brand-deep)]',
    },
]

/* Mobile nav — same as NAV_ITEMS plus Data. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
    ...NAV_ITEMS,
    { label: 'Data', href: SITE.dataUrl, internal: true, icon: Database, ...VIOLET_ITEM },
]

export const FOOTER_NAV_ITEMS: NavItem[] = [
    { label: 'Data', href: SITE.dataUrl, internal: true, icon: Database, ...VIOLET_ITEM },
    { label: 'GitHub', href: SITE.githubMapUrl, internal: false, icon: GithubIcon, ...INK_ITEM },
]

const NAV_LINK_CLASS =
    'group inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[14px] font-normal text-[color:var(--ink-soft)] transition-colors'

export function IconNavLinks({ items = NAV_ITEMS }: { items?: NavItem[] } = {}) {
    return (
        <>
            {items.map((item) => {
                const className = cn(NAV_LINK_CLASS, item.hoverClass)
                const inner = (
                    <>
                        {item.icon && <item.icon className={cn('size-4', item.iconClass)} />}
                        {item.label}
                    </>
                )
                return item.internal ? (
                    <Link key={item.label} href={item.href} className={className}>
                        {inner}
                    </Link>
                ) : (
                    <a key={item.label} href={item.href} target='_blank' rel='noopener noreferrer' className={className}>
                        {inner}
                    </a>
                )
            })}
        </>
    )
}

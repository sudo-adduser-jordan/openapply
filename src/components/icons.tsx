import type { SVGProps } from 'react'

export function Checkmark(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M20 6 9 17l-5-5' />
        </svg>
    )
}

export function Building(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16' />
            <path d='M14 21v-3a2 2 0 0 0-4 0v3' />
            <path d='M10 8h4' />
            <path d='M10 12h4' />
        </svg>
    )
}

export function Briefcase(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
            <rect width='20' height='14' x='2' y='6' rx='2' />
        </svg>
    )
}

export function Bookmark(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='currentColor' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
        </svg>
    )
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
            <path d='M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.81 0-1.28.47-2.33 1.24-3.15-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.2.96-.26 1.98-.39 3-.4 1.02 0 2.04.14 3 .4 2.29-1.52 3.3-1.2 3.3-1.2.65 1.65.24 2.87.12 3.17.77.82 1.23 1.87 1.23 3.15 0 4.51-2.81 5.5-5.49 5.79.43.36.81 1.09.81 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.69.82.57A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z' />
        </svg>
    )
}

export function Eye(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
            <circle cx='12' cy='12' r='3' />
        </svg>
    )
}

export function Database(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <ellipse cx='12' cy='5' rx='9' ry='3' />
            <path d='M3 5V19A9 3 0 0 0 21 19V5' />
            <path d='M3 12A9 3 0 0 0 21 12' />
        </svg>
    )
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <circle cx='12' cy='12' r='5' />
            <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' />
        </svg>
    )
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
        </svg>
    )
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M18 6 6 18M6 6l12 12' />
        </svg>
    )
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M4 6h16M4 12h16M4 18h16' />
        </svg>
    )
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
        </svg>
    )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M5 12h14M12 5v14' />
        </svg>
    )
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.3-4.3' />
        </svg>
    )
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
            <circle cx='12' cy='10' r='3' />
        </svg>
    )
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3' />
        </svg>
    )
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={3} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='m6 9 6 6 6-6' />
        </svg>
    )
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26' />
        </svg>
    )
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <line x1='4' y1='6' x2='20' y2='6' />
            <line x1='7' y1='12' x2='17' y2='12' />
            <line x1='10' y1='18' x2='14' y2='18' />
        </svg>
    )
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth={1.5} strokeLinecap='square' {...props}>
            <path d='M8 2v9M4 7l4 4 4-4M3 14h10' />
        </svg>
    )
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.25} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='M5 12h14' />
            <path d='m12 5 7 7-7 7' />
        </svg>
    )
}

export function MinusIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={3} strokeLinecap='round' {...props}>
            <path d='M5 12h14' />
        </svg>
    )
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='m15 18-6-6 6-6' />
        </svg>
    )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.2} strokeLinecap='round' strokeLinejoin='round' {...props}>
            <path d='m9 18 6-6-6-6' />
        </svg>
    )
}

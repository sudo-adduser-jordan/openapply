import './globals.css'
import type { Metadata } from 'next'
import { fredoka, urbanist } from './fonts'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { NuqsProvider } from '@/components/NuqsProvider'

export const metadata: Metadata = {
    title: 'OpenApply Map',
    robots: {
        index: false,
        follow: false,
    },
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
            { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: [
            { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { url: '/icons/apple-touch-icon-167x167.png', sizes: '167x167', type: 'image/png' },
        ],
        other: [
            { rel: 'icon', url: '/icons/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
            { rel: 'icon', url: '/icons/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
    },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en' className={`${fredoka.variable} ${urbanist.variable}`} suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: '(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme:light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()',
                    }}
                />
            </head>
            <body className='antialiased'>
                <Analytics />
                <SpeedInsights />
                <NuqsProvider>{children}</NuqsProvider>
            </body>
        </html>
    )
}

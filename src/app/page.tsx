import { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { GithubIcon, ArrowRightIcon } from '@/components/icons'

export const metadata: Metadata = {
    title: 'OpenApply',
}

export default function LandingPage() {
    return (
        <div className='flex h-screen flex-col overflow-y-auto bg-[var(--bg)] text-[var(--ink)]'>
            <PageHeader />

            <main className='relative flex flex-1 items-center justify-center overflow-hidden'>
                <div className='overflow-hidden bg-transparent px-6'>
                    <span
                        className='pointer-events-none absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-[color:var(--brand)] text-white'
                        style={{
                            left: '4%',
                            top: '16%',
                            transform: 'translate(0px) rotate(-8deg)',
                        }}
                    >
                        4.5M roles
                    </span>
                    <span
                        className='pointer-events-none absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-yellow-300 text-[#0b0d12]'
                        style={{ left: '80%', top: '8%', transform: 'translate(0px) rotate(7deg)' }}
                    >
                        49 ATS
                    </span>
                    <Link
                        href='/jobs?companies=Ashby'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-pink-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '11%',
                            top: '74%',
                            transform: 'translate(0px) rotate(5deg)',
                        }}
                    >
                        Ashby
                    </Link>
                    <Link
                        href='/jobs?companies=OpenAI'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-emerald-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '82%',
                            top: '72%',
                            transform: 'translate(0px) rotate(-6deg)',
                        }}
                    >
                        OpenAI
                    </Link>
                    <Link
                        href='/jobs?companies=Anthropic'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-violet-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '1%',
                            top: '44%',
                            transform: 'translate(0px) rotate(10deg)',
                        }}
                    >
                        Anthropic
                    </Link>
                    <Link
                        href='/jobs?companies=Amazon'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-orange-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '88%',
                            top: '42%',
                            transform: 'translate(0px) rotate(-12deg)',
                        }}
                    >
                        Amazon
                    </Link>
                    <Link
                        href='/jobs?companies=Apple'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex lab-pill-ink shadow-[var(--shadow-sm)] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '30%',
                            top: '6%',
                            transform: 'translate(0px) rotate(-4deg)',
                        }}
                    >
                        Apple
                    </Link>
                    <Link
                        href='/jobs?companies=NVIDIA'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex lab-pill-paper bg-[color:var(--paper-3)] text-[#0b0d12] ring-1 ring-[color:var(--line-strong)] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '64%',
                            top: '86%',
                            transform: 'translate(0px) rotate(6deg)',
                        }}
                    >
                        NVIDIA
                    </Link>
                    <Link
                        href='/jobs?companies=Google'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-[color:var(--brand)] text-white cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '18%',
                            top: '90%',
                            transform: 'translate(0px) rotate(-3deg)',
                        }}
                    >
                        Google
                    </Link>
                    <Link
                        href='/jobs?companies=TikTok'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-yellow-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '72%',
                            top: '22%',
                            transform: 'translate(0px) rotate(9deg)',
                        }}
                    >
                        TikTok
                    </Link>
                    <Link
                        href='/jobs?companies=Microsoft'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-pink-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '6%',
                            top: '60%',
                            transform: 'translate(0px) rotate(-10deg)',
                        }}
                    >
                        Microsoft
                    </Link>
                    <Link
                        href='/jobs?search=@location:NYC'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-emerald-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '90%',
                            top: '60%',
                            transform: 'translate(0px) rotate(8deg)',
                        }}
                    >
                        NYC
                    </Link>
                    <Link
                        href='/jobs?search=@location:US'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-violet-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{
                            left: '42%',
                            top: '90%',
                            transform: 'translate(0px) rotate(-5deg)',
                        }}
                    >
                        US
                    </Link>
                    <Link
                        href='/jobs?remote=true'
                        className='absolute z-10 hidden items-center rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium shadow-[var(--shadow-sm)] md:inline-flex bg-orange-300 text-[#0b0d12] cursor-pointer hover:scale-110 hover:shadow-lg transition-all'
                        style={{ left: '56%', top: '4%', transform: 'translate(0px) rotate(4deg)' }}
                    >
                        Remote
                    </Link>

                    <div className='relative z-20 mx-auto max-w-[720px] text-center'>
                        <h1 className='text-[clamp(38px,6vw,76px)] font-semibold leading-[1.04] tracking-[-0.03em] text-[color:var(--ink)]'>
                            Explore, search, and find <span className='text-[color:var(--brand-deep)]'>your next job.</span>
                        </h1>

                        <div className='mt-7 flex flex-wrap items-center justify-center gap-3'>
                            <Link
                                href='/jobs'
                                className='group inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[color:var(--brand)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[color:var(--brand-deep)]'
                            >
                                OpenApply
                                <ArrowRightIcon className='size-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
                            </Link>
                            <a
                                href='https://github.com/kalil0321/stapply'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-[14px] font-medium transition-colors text-[color:var(--ink-soft)] hover:bg-[color:var(--paper-3)]'
                            >
                                <GithubIcon className='size-4' aria-hidden='true' />
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

import type { ExperienceLevel } from '@/types'

export function isRemoteJob(job: { is_remote?: boolean | null; location?: string | null }): boolean {
    if (job.is_remote === true) return true
    if (job.is_remote === false) return false
    return /\bremote\b/i.test(job.location || '')
}

export function matchesExperienceLevel(job: { experience?: string | null }, level: ExperienceLevel): boolean {
    const exp = job.experience
    const y = exp
        ? (() => {
              const m = exp.match(/\d+/)
              return m ? parseInt(m[0], 10) : Infinity
          })()
        : Infinity
    if (!isFinite(y)) return false
    if (level === 'entry') return y <= 2
    if (level === 'mid') return y >= 3 && y <= 5
    return y >= 6
}

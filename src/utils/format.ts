import type { JobMarker } from '@/types'

export function formatJobDate(job: JobMarker): string | null {
    if (!job.posted_at) {
        return null
    }

    const postedDate = new Date(job.posted_at)

    if (isNaN(postedDate.getTime())) {
        return null
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const postedDay = new Date(postedDate.getFullYear(), postedDate.getMonth(), postedDate.getDate())

    const diffMs = today.getTime() - postedDay.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return null

    if (diffDays === 0 || diffDays === 1) {
        return 'New'
    }

    if (diffDays < 7) {
        return `${diffDays}d`
    }

    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks <= 4) {
        return `${diffWeeks}w`
    }

    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths < 12) {
        return `${diffMonths}m`
    }

    return '+1y'
}

export function getJobDate(job: JobMarker): Date | null {
    if (!job.posted_at) {
        return null
    }

    const postedDate = new Date(job.posted_at)

    if (isNaN(postedDate.getTime())) {
        return null
    }

    return postedDate
}

function normalizeJobUrl(url: string): string {
    try {
        const urlObj = new URL(url)
        const host = urlObj.hostname

        if (host.endsWith('amazon.com') && !host.endsWith('amazon.jobs')) {
            urlObj.hostname = host.replace(/amazon\.com$/, 'amazon.jobs')
        }

        return urlObj.toString()
    } catch {
        return url
    }
}

export function addUtmParams(
    url: string,
    source: string = 'stapply',
    medium: string = 'job_board',
    campaign: string = 'job_listing',
): string {
    try {
        const normalizedUrl = normalizeJobUrl(url)
        const urlObj = new URL(normalizedUrl)

        if (!urlObj.searchParams.has('utm_source')) {
            urlObj.searchParams.set('utm_source', source)
        }
        if (!urlObj.searchParams.has('utm_medium')) {
            urlObj.searchParams.set('utm_medium', medium)
        }
        if (!urlObj.searchParams.has('utm_campaign')) {
            urlObj.searchParams.set('utm_campaign', campaign)
        }

        return urlObj.toString()
    } catch {
        return normalizeJobUrl(url)
    }
}

function formatSalaryFromDict(salarySummary: string): string | null {
    const unitMatch = salarySummary.match(/'unit':\s*['"]([^'"]+)['"]|"unit":\s*['"]([^'"]+)['"]/i)
    const amountMatch = salarySummary.match(/'amount':\s*['"]([^'"]+)['"]|"amount":\s*['"]([^'"]+)['"]/i)

    if (unitMatch && amountMatch) {
        const unit = (unitMatch[1] || unitMatch[2] || '').toUpperCase()
        const amountStr = amountMatch[1] || amountMatch[2] || ''
        const amount = parseFloat(amountStr)

        if (!isNaN(amount)) {
            const currencySymbol = getCurrencySymbol(unit)
            const formattedAmount = formatNumberAsK(amount)
            return `${currencySymbol}${formattedAmount}K`
        }
    }

    return null
}

function formatNumberAsK(num: number): string {
    const thousands = num / 1000
    const rounded = Math.round(thousands)
    return rounded.toString()
}

function formatNumberAsKDecimal(num: number): string {
    const thousands = num / 1000
    const rounded = Math.round(thousands * 10) / 10
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)
}

function formatSingleSalary(salarySummary: string): string | null {
    const singleMatch = salarySummary.match(/^([$€£¥₹]|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR\s*)?([\d,]+)$/i)

    if (singleMatch) {
        const currencyPrefix = (singleMatch[1] || '$').trim()
        const numberStr = singleMatch[2].replace(/,/g, '')

        const amount = parseFloat(numberStr)

        if (!isNaN(amount) && amount > 0) {
            let currencySymbol = '$'
            if (currencyPrefix.startsWith('$')) {
                currencySymbol = '$'
            } else if (currencyPrefix.startsWith('€')) {
                currencySymbol = '€'
            } else if (currencyPrefix.startsWith('£')) {
                currencySymbol = '£'
            } else if (currencyPrefix.startsWith('¥')) {
                currencySymbol = '¥'
            } else if (currencyPrefix.startsWith('₹')) {
                currencySymbol = '₹'
            } else if (currencyPrefix) {
                currencySymbol = getCurrencySymbol(currencyPrefix)
            }

            const formatted = formatNumberAsK(amount)
            return `${currencySymbol}${formatted}K`
        }
    }

    return null
}

function formatSalaryRange(salarySummary: string): string | null {
    const doubleCurrencyMatch = salarySummary.match(/^([$€£¥₹])([\d,]+)\s*[-–—]\s*\1([\d,]+)$/i)

    if (doubleCurrencyMatch) {
        const currencySymbol = doubleCurrencyMatch[1]
        const minStr = doubleCurrencyMatch[2].replace(/,/g, '')
        const maxStr = doubleCurrencyMatch[3].replace(/,/g, '')

        const min = parseFloat(minStr)
        const max = parseFloat(maxStr)

        if (!isNaN(min) && !isNaN(max)) {
            const formattedMin = formatNumberAsKDecimal(min)
            const formattedMax = formatNumberAsKDecimal(max)

            return `${currencySymbol}${formattedMin}K - ${currencySymbol}${formattedMax}K`
        }
    }

    const rangeMatch = salarySummary.match(/^([$€£¥₹]|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR\s*)?([\d,]+)\s*[-–—]\s*([\d,]+)$/i)

    if (rangeMatch) {
        const currencyPrefix = (rangeMatch[1] || '$').trim()
        const minStr = rangeMatch[2].replace(/,/g, '')
        const maxStr = rangeMatch[3].replace(/,/g, '')

        const min = parseFloat(minStr)
        const max = parseFloat(maxStr)

        if (!isNaN(min) && !isNaN(max)) {
            let currencySymbol = '$'
            if (currencyPrefix.startsWith('$')) {
                currencySymbol = '$'
            } else if (currencyPrefix.startsWith('€')) {
                currencySymbol = '€'
            } else if (currencyPrefix.startsWith('£')) {
                currencySymbol = '£'
            } else if (currencyPrefix.startsWith('¥')) {
                currencySymbol = '¥'
            } else if (currencyPrefix.startsWith('₹')) {
                currencySymbol = '₹'
            } else if (currencyPrefix) {
                currencySymbol = getCurrencySymbol(currencyPrefix)
            }

            const formattedMin = formatNumberAsKDecimal(min)
            const formattedMax = formatNumberAsKDecimal(max)

            return `${currencySymbol}${formattedMin}K - ${currencySymbol}${formattedMax}K`
        }
    }

    return null
}

export function formatSalaryString(salaryStr: string): string {
    if (!salaryStr) return salaryStr

    const rangeFormatted = formatSalaryRange(salaryStr)
    if (rangeFormatted) {
        return rangeFormatted
    }

    const singleFormatted = formatSingleSalary(salaryStr)
    if (singleFormatted) {
        return singleFormatted
    }

    if (salaryStr.includes('unit') && salaryStr.includes('amount')) {
        const formatted = formatSalaryFromDict(salaryStr)
        if (formatted) {
            return formatted
        }
    }

    return salaryStr
}

export function formatSalary(job: JobMarker): string | null {
    if (job.salary_summary) {
        return formatSalaryString(job.salary_summary)
    }

    if (job.salary_min != null || job.salary_max != null) {
        const min = job.salary_min ?? 0
        const max = job.salary_max ?? 0
        const currency = job.salary_currency || 'USD'
        const symbol = getCurrencySymbol(currency)

        if (min > 0 && max > 0) {
            return `${symbol}${formatNumberAsKDecimal(min)}K - ${symbol}${formatNumberAsKDecimal(max)}K`
        }
        if (min > 0) {
            return `${symbol}${formatNumberAsK(min)}K`
        }
        if (max > 0) {
            return `${symbol}${formatNumberAsK(max)}K`
        }
    }

    return null
}

function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
        CHF: 'CHF ',
        CNY: '¥',
        INR: '₹',
    }
    return symbols[currency.toUpperCase()] || `${currency} `
}

export function formatExperience(experience: string | null | undefined): string | null {
    if (!experience) return null

    const numberMatch = experience.match(/\d+/)
    if (numberMatch) {
        const value = numberMatch[0]
        return `${value}+ y`
    }

    return null
}

export function getCountry(location: string): string {
    const parts = location.split(', ')
    const last = parts[parts.length - 1]
    if (parts.length === 1) return location
    if (parts.length >= 2 && last) return last
    return location
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function generateCompanySlug(companyName: string): string {
    return slugify(companyName)
}

export function getSalaryValue(salarySummary: string | null | undefined): number {
    if (!salarySummary) return -1

    const normalized = salarySummary.replace(/[$€£¥₹]/g, '')

    const dictAmountMatch = normalized.match(/'amount':\s*['"]([^'"]+)['"]|"amount":\s*['"]([^'"]+)['"]/i)
    if (dictAmountMatch) {
        const amount = parseFloat(dictAmountMatch[1] || dictAmountMatch[2] || '')
        if (!isNaN(amount)) return amount + 0.5
    }

    const rangeMatch = normalized.match(/([\d,]+)\s*K?\s*[-–—]\s*([\d,]+)\s*K?/i)
    if (rangeMatch) {
        let min = parseFloat(rangeMatch[1].replace(/,/g, ''))
        if (/K/i.test(rangeMatch[0])) min = min * 1000
        if (!isNaN(min)) return min
    }

    const singleMatch = normalized.match(/([\d,]+)\s*K?/i)
    if (singleMatch) {
        let amount = parseFloat(singleMatch[1].replace(/,/g, ''))
        if (/K/i.test(singleMatch[0])) amount = amount * 1000
        if (!isNaN(amount)) return amount + 0.5
    }

    return -1
}

export function formatAppliedDate(value: string | null | undefined): string | null {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function formatAppliedInputDate(value: string | null | undefined): string {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function toIsoFromDateInput(value: string): string | null {
    if (!value) return null
    const parsed = new Date(`${value}T12:00:00`)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toISOString()
}

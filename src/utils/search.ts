import type { ExperienceLevel } from '@/types'

function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const matrix: number[][] = []

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1)
            }
        }
    }

    return matrix[len1][len2]
}

function isFuzzyMatch(word: string, target: string, threshold: number): boolean {
    const lengthRatio = Math.min(word.length, target.length) / Math.max(word.length, target.length)
    return lengthRatio >= 0.5 && similarityRatio(target, word) >= threshold
}

function similarityRatio(str1: string, str2: string): number {
    const maxLen = Math.max(str1.length, str2.length)
    if (maxLen === 0) return 1
    const distance = levenshteinDistance(str1, str2)
    return 1 - distance / maxLen
}

export function fuzzyMatch(text: string, query: string, threshold: number = 0.6): boolean {
    const normalizedText = text.toLowerCase().trim()
    const normalizedQuery = query.toLowerCase().trim()

    if (normalizedText === normalizedQuery) {
        return true
    }

    const wholeStringSimilarity = similarityRatio(normalizedText, normalizedQuery)
    if (wholeStringSimilarity >= threshold) {
        return true
    }

    const wordBoundaryRegex = new RegExp(`\\b${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (wordBoundaryRegex.test(normalizedText)) {
        return true
    }

    if (normalizedQuery.length >= 3 && normalizedText.includes(normalizedQuery)) {
        return true
    }

    const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0)
    const textWords = normalizedText.split(/\s+/).filter((w) => w.length > 0)

    if (queryWords.length === 1) {
        const queryWord = queryWords[0]

        if (queryWord.length <= 2) {
            return normalizedText.includes(normalizedQuery)
        }

        for (const textWord of textWords) {
            if (textWord === queryWord) {
                return true
            }

            if (queryWord.length >= 4 && textWord.includes(queryWord)) {
                return true
            }

            if (isFuzzyMatch(queryWord, textWord, threshold)) {
                return true
            }
        }
        return false
    }

    return queryWords.every((queryWord) => {
        if (textWords.some((textWord) => textWord === queryWord)) {
            return true
        }

        const wordRegex = new RegExp(`\\b${queryWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (wordRegex.test(normalizedText)) {
            return true
        }

        if (queryWord.length >= 3 && normalizedText.includes(queryWord)) {
            return true
        }

        for (const textWord of textWords) {
            if (isFuzzyMatch(queryWord, textWord, threshold)) {
                return true
            }
        }
        return false
    })
}

function normalizeForSearch(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
}

function tokenize(value: string): string[] {
    return normalizeForSearch(value).match(/[a-z0-9]+/g) ?? []
}

function isPluralVariant(token: string, term: string): boolean {
    return token === `${term}s` || term === `${token}s`
}

function tokenMatchesTerm(token: string, term: string): boolean {
    if (token === term || isPluralVariant(token, term)) {
        return true
    }

    if (term.length >= 5 && token.startsWith(term)) {
        const suffix = token.slice(term.length)
        return ['ing', 'er', 'ers', 'ed'].includes(suffix)
    }

    return false
}

export function matchesSearchTerm(text: string, term: string, options: { fuzzy?: boolean } = {}): boolean {
    const normalizedTerm = normalizeForSearch(term)
    if (!normalizedTerm) return true

    const textTokens = tokenize(text)
    const termTokens = tokenize(normalizedTerm)
    if (termTokens.length === 0) return true

    if (termTokens.length > 1) {
        return termTokens.every((token) => matchesSearchTerm(text, token, options))
    }

    const singleTerm = termTokens[0]
    if (textTokens.some((token) => tokenMatchesTerm(token, singleTerm))) {
        return true
    }

    if (options.fuzzy && singleTerm.length >= 5) {
        return textTokens.some((token) => token.length >= 5 && fuzzyMatch(token, singleTerm, 0.82))
    }

    return false
}

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

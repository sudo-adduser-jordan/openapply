import { fuzzyMatch } from './fuzzy-match'

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

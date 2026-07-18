import { useState, useEffect, useRef } from 'react'
import { useQueryState } from 'nuqs'
import { useDebounce } from './use-debounce'

export function useSyncedSearchParam(
    paramName: string,
    defaultValue: string = '',
    debounceMs: number = 300,
): [string, (value: string) => void, string, string, (value: string | null) => void] {
    const [urlValue, setUrlValue] = useQueryState(paramName, {
        defaultValue: '',
        clearOnDefault: true,
    })
    const [localValue, setLocalValue] = useState(urlValue || defaultValue)
    const debouncedValue = useDebounce(localValue, debounceMs)
    const isInternalRef = useRef(false)

    useEffect(() => {
        if (!isInternalRef.current && urlValue !== localValue) {
            setLocalValue(urlValue || defaultValue)
        }
        isInternalRef.current = false
    }, [urlValue, localValue, defaultValue])

    useEffect(() => {
        if (debouncedValue !== urlValue) {
            isInternalRef.current = true
            setUrlValue(debouncedValue || null)
        }
    }, [debouncedValue, urlValue, setUrlValue])

    return [localValue, setLocalValue, debouncedValue, urlValue, setUrlValue]
}

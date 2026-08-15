'use client'

import clsx from 'clsx'
import { PencilIcon, XIcon } from './icons'

interface ListTabProps {
    list: { id: string; name: string }
    isActive: boolean
    count: number
    isRenaming: boolean
    renameValue: string
    onRenameChange: (value: string) => void
    onFinishRename: () => void
    onCancelRename: () => void
    onSelect: () => void
    onStartRename: () => void
    showDelete: boolean
    onConfirmDelete: () => void
    onCancelDelete: () => void
    onDelete: () => void
}

const DEFAULT_LIST_ID = 'default'

export function ListTab({
    list,
    isActive,
    count,
    isRenaming,
    renameValue,
    onRenameChange,
    onFinishRename,
    onCancelRename,
    onSelect,
    onStartRename,
    showDelete,
    onConfirmDelete,
    onCancelDelete,
    onDelete,
}: ListTabProps) {
    return (
        <div className='relative shrink-0'>
            {isRenaming ? (
                <div className='flex items-center rounded-md border border-blue-400/50 bg-[var(--bg)] px-2 py-1'>
                    <input
                        value={renameValue}
                        onChange={(e) => onRenameChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); onFinishRename() }
                            if (e.key === 'Escape') onCancelRename()
                        }}
                        onBlur={onFinishRename}
                        className='w-24 bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)]'
                        placeholder='List name'
                    />
                </div>
            ) : (
                <div
                    onClick={onSelect}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
                    }}
                    role='button'
                    tabIndex={0}
                    className={clsx(
                        'group relative inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium transition-colors whitespace-nowrap border cursor-pointer',
                        isActive
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-[var(--paper-3)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]',
                    )}
                >
                    <span>{list.name}</span>
                    <span className={clsx('text-[10px]', isActive ? 'text-blue-400/70' : 'text-[var(--ink-mute)]')}>
                        {count}
                    </span>
                    {!isActive && list.id !== DEFAULT_LIST_ID && (
                        <>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStartRename() }}
                                className='ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ink-mute)] hover:text-[var(--ink)]'
                                aria-label={`Rename ${list.name}`}
                            >
                                <PencilIcon width={10} height={10} />
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirmDelete() }}
                                className='ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--ink-mute)] hover:text-red-400'
                                aria-label={`Delete ${list.name}`}
                            >
                                <XIcon width={10} height={10} />
                            </button>
                        </>
                    )}
                </div>
            )}

            {showDelete && (
                <div className='absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 min-w-[140px] rounded-lg border border-[var(--line)] bg-[var(--paper-3)] p-2 shadow-xl'>
                    <p className='text-[11px] text-[var(--ink)] mb-2 px-1'>Delete &ldquo;{list.name}&rdquo;?</p>
                    <div className='flex gap-1.5 justify-end'>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancelDelete() }}
                            className='px-2 py-0.5 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] rounded-md transition-colors'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
                            className='px-2 py-0.5 text-[11px] font-medium text-white bg-red-500/60 hover:bg-red-500/80 rounded-md transition-colors'
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

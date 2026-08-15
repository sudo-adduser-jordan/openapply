'use client'

import type { RefObject } from 'react'
import clsx from 'clsx'
import { ListNameInput } from '@/components/ListNameInput'
import { StarIcon, PlusIcon } from './icons'

interface ListPopoverProps {
    popoverRef: RefObject<HTMLDivElement | null>
    watchlists: { id: string; name: string }[]
    isInList: (name: string, listId: string) => boolean
    name: string
    activeListId: string | null
    creating: boolean
    newListName: string
    setNewListName: (value: string) => void
    handleListToggle: (listId: string) => void
    handleCreateList: () => void
    setCreating: (value: boolean) => void
    onClose: () => void
}

export function ListPopover({
    popoverRef,
    watchlists,
    isInList,
    name,
    activeListId,
    creating,
    newListName,
    setNewListName,
    handleListToggle,
    handleCreateList,
    setCreating,
    onClose,
}: ListPopoverProps) {

    return (
        <div
            ref={popoverRef}
            className='absolute right-0 top-full z-50 mt-1.5 min-w-[200px] rounded-xl border border-[var(--line)] bg-[var(--paper-3)] shadow-xl'
        >
            <div className='px-3 py-2 text-[11px] font-medium text-[var(--ink-mute)] uppercase tracking-wider'>Watchlists</div>
            <div className='max-h-[200px] overflow-y-auto'>
                {watchlists.map((list) => {
                    const inList = isInList(name, list.id)
                    return (
                        <button
                            key={list.id}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleListToggle(list.id)
                                onClose()
                            }}
                            className='flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--ink)] hover:bg-[var(--hover-bg)] transition-colors'
                        >
                            <StarIcon
                                width={12}
                                height={12}
                                fill={inList ? 'currentColor' : 'none'}
                                stroke='currentColor'
                                strokeWidth={2}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className={clsx('shrink-0', inList ? 'text-blue-400' : 'text-[var(--ink-mute)]')}
                            />
                            <span className='flex-1 truncate'>{list.name}</span>
                            {list.id === activeListId && <span className='text-[10px] text-[var(--ink-mute)]'>Active</span>}
                        </button>
                    )
                })}
            </div>
            {creating ? (
                <div className='border-t border-[var(--line)] px-3 py-2'>
                    <ListNameInput
                        value={newListName}
                        onChange={setNewListName}
                        onCreate={handleCreateList}
                        onCancel={() => { setCreating(false); setNewListName('') }}
                        autoFocus
                        className='w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] outline-none focus:border-blue-400/50'
                    />
                    <div className='mt-1.5 flex gap-1.5 justify-end'>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCreating(false)
                                setNewListName('')
                            }}
                            className='px-2 py-0.5 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] rounded-md transition-colors'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleCreateList()
                            }}
                            disabled={!newListName.trim()}
                            className='px-2 py-0.5 text-[11px] font-medium text-white bg-blue-500/60 hover:bg-blue-500/80 rounded-md transition-colors disabled:opacity-40'
                        >
                            Create
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCreating(true)
                    }}
                    className='flex w-full items-center gap-2 border-t border-[var(--line)] px-3 py-2 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--hover-bg)] transition-colors rounded-b-xl'
                >
                <PlusIcon width={12} height={12} />
                    New List
                </button>
            )}
        </div>
    )
}

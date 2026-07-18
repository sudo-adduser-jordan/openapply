import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { ArrowTable } from '@/types'

const PARQUET_BASE = 'https://github.com/sudo-adduser-jordan/openats/raw/refs/heads/main/data/parquet'

async function fetchParquetBuffer(url: string): Promise<Uint8Array> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch parquet: ${response.status} ${response.statusText}`)
    }
    return new Uint8Array(await response.arrayBuffer())
}

async function parseParquetBuffer(buffer: Uint8Array): Promise<ArrowTable> {
    const wasmPath = path.join(process.cwd(), 'node_modules', 'parquet-wasm', 'esm', 'parquet_wasm_bg.wasm')
    const wasmBytes = readFileSync(wasmPath)
    const pw = await import('parquet-wasm/esm')
    pw.initSync({ module: wasmBytes })
    const arrow = await import('apache-arrow')
    const table = pw.readParquet(buffer)
    return arrow.tableFromIPC(table.intoIPCStream())
}

export async function fetchAndParseParquet(filePath: string): Promise<ArrowTable> {
    const url = `${PARQUET_BASE}/${filePath}`
    const buffer = await fetchParquetBuffer(url)
    return parseParquetBuffer(buffer)
}

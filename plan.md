# Plan: Resume Upload + AI Query Context

## Overview

Add a dedicated `/resume` page where a user uploads a PDF resume. The server **security-checks** it, **extracts only its text** (raw PDF bytes are never stored), and the text is kept **in the browser (IndexedDB)**. A stub-ready AI layer builds job context from the parquet database (`loadAllJobsOnce`) plus the resume text, ready for a real LLM later.

**Decisions (confirmed):** dedicated page · LLM as a stubbed interface · browser-only storage (no DB/server persistence of resume content).

## 1. New files

```
src/app/resume/page.tsx              — server page wrapper (DirectoryLayout)
src/components/ResumeClient.tsx      — client page: upload + status + AI panel
src/components/ResumeUpload.tsx      — dropzone + client pre-checks + progress/states
src/hooks/use-resume.ts              — IndexedDB get/set/clear (extracted text only)
src/app/api/resume/route.ts          — POST upload → security check → text extraction
src/utils/resume-security.ts         — authoritative server-side validation
src/utils/resume-pdf.ts              — PDF text extraction (pdf-parse) wrapper
src/utils/parquet-context.ts         — build AI context from jobs parquet + resume text
src/lib/ai-provider.ts               — AiProvider interface + StubAiProvider
test/utils/resume-security.test.ts
test/utils/parquet-context.test.ts
test/hooks/use-resume.test.ts
test/components/resume-upload.test.tsx
```

## 2. Security model

**Client-side pre-checks (UX only, never trusted):** extension `.pdf`, `file.type === 'application/pdf'`, size ≤ 5 MB, magic bytes `%PDF-`.

**Server-side (`resume-security.ts`)** — single source of truth, mirroring the existing `src/utils/` pattern:

1. **Size cap** — reject > 5 MB (413). Enforced by reading the multipart stream with a hard byte cap, cross-checked against `file.size`.
2. **Extension + MIME sniffing** — trust neither header nor extension: require first 5 bytes `%PDF-` and a PDF version `%PDF-1.x`.
3. **Root-of-trust oddity rejection** — basic structural sanity (`%%EOF` marker present).
4. **Active-content scan** — scan raw bytes for embedding indicators (`/JavaScript`, `/JS`, `/OpenAction`, `/Launch`, `/EmbeddedFile`, `/RichMedia`, `/XFA`, `/SubmitForm`, `/ImportData`, `/AcroForm`); reject if found (defense in depth).
5. **Text-only quarantine (primary defense)** — parse PDF → extracted text only; **raw bytes are discarded immediately** and never returned, logged, or stored. Even a novel exploit keeps no payload: only plain text survives.
6. **Content sanity** — require ≥ 100 chars of extracted text to reject empty/scanned/garbage PDFs.
7. **Rate limiting + logging** — per-IP in-memory window limiter (note the serverless caveat that it resets per lambda — acceptable for v1); log only size + SHA-256 checksum + pass/reject decision, never resume content.
8. **No persistence on server** — response returns `{ checksum, text, meta }`; client stores text; server keeps nothing.

## 3. Extraction library

Add `pdf-parse` (+ `@types/pdf-parse` dev). Pure-JS parser, no wasm/worker wiring headaches in Next.js Node runtime; add `serverExternalPackages: ['pdf-parse']` to `next.config.ts`. Upgrade path to `pdfjs-dist` for malformed/scan-heavy PDFs noted for future.

## 4. API — `POST /api/resume`

- Multipart via `request.formData()` (Node runtime; `maxDuration` set).
- Runs 1–5 above; on success returns `{ ok: true, checksum, text, chars, pages }`; on rejection `{ ok: false, reason }` (pick explicit 415/413/400 mapping).
- Never echoes the file back.

## 5. Client page (`/resume`)

- `ResumeUpload`: drag/drop + picker; client pre-checks short-circuit most errors; upload → `/api/resume`; states: idle → uploading → verified (checksum shown) / error.
- `use-resume`: stores `{ text, checksum, uploadedAt }` in IndexedDB (`tg-resume`); survives refresh; mirror existing `use-local-storage-list.ts` hook style. *(jsdom lacks IndexedDB — add `fake-indexeddb` to test setup.)*
- **AI panel**: question box → `parquet-context` → `StubAiProvider` (interface `complete({system, user})`). Stub returns canned guidance; wiring and context building are real, LLM call is a placeholder behind `AI_API_KEY`-gate later.

## 6. Parquet context builder (`parquet-context.ts`)

- Reuses `loadAllJobsOnce()` singleton (already loads `jobs_recent.parquet` server-side).
- Builds a compact job excerpt set: keyword-filtered by question, top-N (e.g. 25), serialized with title/company/location/salary/url/remote/posted_at + truncated description; appends schema summary + resume text; returns within a token budget.

## 7. Tests

- `resume-security`: magic-byte reject, oversize, active-content token reject, empty-text reject, valid pass.
- `parquet-context`: filter/top-N/truncation + resume inclusion.
- `use-resume`: IDB get/set/clear (fake-indexeddb).
- `resume-upload`: client pre-check gating + error UI.

## 8. Env/config (add, not required for stub)

`next.config.ts` — `serverExternalPackages: ['pdf-parse']`; future `AI_API_KEY`, `AI_MODEL`. No `.env` committed.

## Open follow-ups (post v1)

Real LLM provider (Vercel AI SDK or direct), optional server-side persistence (KV/Blob), server-side streaming of AI answers, and `.pdf` text-layer lossy cases.
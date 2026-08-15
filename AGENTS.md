# Map — Agent Guide

## Overview

Job board viewer that fetches parquet files from GitHub and renders them in the browser.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- parquet-wasm + apache-arrow for parquet parsing

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm test` — run all tests
- `npm run test:watch` — watch mode
- `npx fallow` — lints

## Conventions

- Use the App Router (`src/app/`)
- Components go in `src/components/`
- API routes in `src/app/api/` — server-side parquet fetching and parsing
- Parquet parsing utilities in `src/utils/parquet.ts`
- Types in `src/types.ts`
- Use Tailwind CSS v4 with `tw-animate-css` for animations
- Images in `public/` — favicons, icons, and static SVGs
- Tests in `test/` — Vitest + @testing-library/react + jsdom (config in `vitest.config.ts`)

## Parquet Schemas

Data source: `sudo-adduser-jordan/openats` — parquet files hosted on GitHub.

### jobs_recent.parquet

| Column            | Type    | Description                           |
| ----------------- | ------- | ------------------------------------- |
| `url`             | string  | Job listing URL                       |
| `title`           | string  | Job title                             |
| `company`         | string  | Company name                          |
| `ats_type`        | string  | ATS platform (e.g. lever, greenhouse) |
| `ats_id`          | string  | ATS-internal job ID                   |
| `location`        | string  | Job location                          |
| `is_remote`       | boolean | Remote job flag                       |
| `salary_min`      | number  | Minimum salary                        |
| `salary_max`      | number  | Maximum salary                        |
| `salary_currency` | string  | Salary currency (e.g. USD)            |
| `salary_period`   | string  | Salary period (yearly, hourly)        |
| `salary_summary`  | string  | Raw salary text                       |
| `employment_type` | string  | Employment type (full-time, contract) |
| `department`      | string  | Department name                       |
| `team`            | string  | Team name                             |
| `description`     | string  | Job description (markdown)            |
| `posted_at`       | string  | ISO date posted                       |
| `requisition_id`  | string  | Requisition ID                        |
| `apply_url`       | string  | Direct apply URL                      |
| `commitment`      | string  | Commitment level                      |
| `country_iso`     | string  | Country ISO code                      |

### companies.parquet

| Column | Type   | Description             |
| ------ | ------ | ----------------------- |
| `ats`  | string | ATS platform name       |
| `name` | string | Company name            |
| `slug` | string | URL-safe company slug   |
| `url`  | string | Company career page URL |
| `raw`  | string | Raw scraped data        |

### watchlists/*.parquet

| Column         | Type   | Description             |
| -------------- | ------ | ----------------------- |
| `ats`          | string | ATS platform name       |
| `company_name` | string | Company name            |
| `company_slug` | string | URL-safe company slug   |
| `notes`        | string | Notes about the company |
| `created_at`   | string | ISO timestamp           |

### ats.parquet

| Column | Type   | Description       |
| ------ | ------ | ----------------- |
| `ats`  | string | ATS platform name |
| `name` | string | Display name      |
| `slug` | string | URL-safe slug     |
| `url`  | string | ATS URL           |
| `raw`  | string | Raw scraped data  |

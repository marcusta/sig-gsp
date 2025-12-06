# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack golf course and records tracking application for GSPro/Simulator Golf Tour (SGT). It consists of:
- **Backend**: Bun + Elysia server with SQLite database (Drizzle ORM)
- **Frontend**: React + Vite with TanStack Query, shadcn/ui, and Tailwind CSS
- **Data Pipeline**: Web scrapers that fetch course records from SGT leaderboards

The application tracks golf courses, tee boxes, player records (Tips and SGT tees), player rankings over time, and record history changes.

## Development Commands

### Backend (Bun)

```bash
# Install dependencies
bun install

# Database migrations (run this first!)
bun run migrate

# Start development server (with auto-reload)
bun run dev

# Start production server
bun run src/server.ts

# Database tools
bun run db:generate    # Generate new migration from schema changes
bun run db:studio      # Open Drizzle Studio to browse database
```

### Frontend (React/Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Build for production (outputs to frontend/dist, then copies to public/gsp/)
npm run build

# Lint
npm run lint
```

## Architecture

### Backend Structure

**Server Entry**: `src/server.ts` - Minimal Elysia server that imports routes
**Routes**: `src/routes.ts` - All API endpoints and the catch-all route for serving the React SPA

**Database**:
- Schema: `src/db/schema.ts` - Drizzle schema with tables for courses, teeBoxes, players, courseRecords, recordModes, teams, scrapeRuns, courseRecordHistory, playerRankSnapshots
- Connection: `src/db/db.ts` - Database instance using better-sqlite3
- Migrations: `src/db/migrations/` - Drizzle migrations; `src/db/migrate.ts` runs them

**Course Data**:
- `src/course-data.ts` - CRUD operations for courses
- `src/course-data-types.ts` - TypeScript types for GKD (course) files
- `src/teebox-data.ts` - Tee box parsing and management from GKD data
- GKD data contains hole-by-hole information, elevations, hazards, tee distances/ratings/slopes

**Scraping System** (`src/scraper/`):
- `index.ts` - Orchestrates scrape runs, creates scrapeRuns records (snapshot generation is decoupled)
- `singles-scraper.ts` - Main scraper for Tips and SGT single-player putting records
- `html-parser.ts` - Parses SGT leaderboard HTML pages using Cheerio
- `player-service.ts` - Creates/updates player records from scraped data
- `history-service.ts` - Tracks record changes (who gained/lost records, course record history)
- `snapshot-service.ts` - Generates player rank snapshots for leaderboard tracking over time (run independently on schedule)
- `types.ts` - Shared scraper types

**Other**:
- `src/sgt-scraper.ts` - Legacy scraper for individual course leaderboards (used by `/api/course-records/:sgtId/:teeType`)
- `src/logger.ts` - Winston logger with daily rotating file transport
- `coursedir-script/collect-data.js` - External script to sync course data from filesystem to server (not part of main app)

### Frontend Structure

**Pages** (in `frontend/src/pages/`):
- Pages fetch data using TanStack Query and pass it to components
- Components are only concerned with rendering, never make API calls directly

**Components** (in `frontend/src/components/`):
- Receive data as props from pages
- Render UI using shadcn/ui primitives

**API Layer**:
- `frontend/src/api/useApi.ts` - Axios instance and custom hooks for API calls
- `frontend/src/types.ts` - TypeScript types for API responses (create new types here when adding API endpoints)

**Routing**:
- React Router handles client-side routing
- Backend serves `public/gsp/index.html` for all non-API routes (SPA catch-all)

### Database Schema Notes

**Course Records Flow**:
1. `recordModes` defines all record type combinations (tee type, player format, putting mode)
2. `courseRecords` stores the current record holder for each course+recordMode
3. `courseRecordHistory` tracks every time a record changes (who held it before, who broke it, score improvement)
4. `playerRankSnapshots` captures leaderboard positions daily for rank tracking over time

**Players vs Teams**:
- `players` stores individual SGT users
- `teams` and `teamMembers` support future team-based record modes (not fully implemented)
- Currently only singles records are actively scraped

### Key Data Flows

**Course Sync from Filesystem**:
1. External script (`coursedir-script/collect-data.js`) reads course files and posts to `/api/update-from-filesystem`
2. Backend parses GKD file, creates/updates course, tee boxes, and tags
3. Course is linked to SGT via `sgtId` for records scraping

**Records Scraping** (triggered via `/api/admin/scrape-records`):
1. `runRecordsScrape()` creates a `scrapeRuns` entry
2. `scrapeSinglesRecords()` fetches all enabled courses and scrapes Tips + SGT records
3. For each course, fetches HTML from SGT, parses with Cheerio, extracts player/score
4. `player-service` upserts players, `history-service` tracks record changes
5. Updates `courseRecords` with current record holders

**Snapshot Generation** (triggered independently via `/api/admin/generate-snapshot`):
- **Decoupled from scraping** to allow scraping multiple times per day while maintaining consistent snapshot intervals
- Should be run on a fixed schedule (e.g., daily at midnight) for clean time-based comparisons
- `generatePlayerRankSnapshot()` captures current leaderboard state and stores in `playerRankSnapshots`
- Enables "movement over last X days" comparisons via `/api/records/leaderboard-with-period` endpoint
- Supports custom time periods: day, week, month (configurable via query parameter)

**Frontend Data Fetching**:
1. Page component uses TanStack Query hook from `useApi.ts`
2. Hook calls backend API endpoint
3. Data returned and passed to child components as props

## Frontend Guidelines (from .cursorrules)

- All TypeScript code must be well-typed
- Use React with TanStack Query (react-query) and shadcn-ui components
- New API types go in `frontend/src/types.ts`
- Pages fetch data and pass to components - components never call APIs directly
- Keep pages and components separated by responsibility

## Important Patterns

**Adding a New API Endpoint**:
1. Add route handler in `src/routes.ts`
2. Define response types in `frontend/src/types.ts`
3. Create TanStack Query hook in `frontend/src/api/useApi.ts`
4. Use hook in page component, pass data to child components

**Database Schema Changes**:
1. Modify `src/db/schema.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run migrate` to apply migration
4. Update any affected TypeScript types

**Course Data Updates**:
- Courses are synced from GKD files via `/api/update-from-filesystem`
- GKD data is stored as JSON in `gk_data` table
- Derived fields (par, elevation, hazards, tee boxes) are extracted and stored in normalized tables

## Testing & Debugging

- `bun run db:studio` - Visual database browser
- Check `logs/` directory for Winston logs (daily rotation)
- Frontend dev server has React Query Devtools enabled
- Use `/api/admin/scrape-status` to check recent scrape runs

## Scheduling Snapshots

Since snapshot generation is decoupled from scraping, you need to set up a scheduled job to run snapshots at consistent intervals.

**Recommended approach:**
- Use a cron job, systemd timer, or task scheduler to call `/api/admin/generate-snapshot` daily at a fixed time (e.g., midnight UTC)
- Example cron entry: `0 0 * * * curl -X POST http://localhost:3000/api/admin/generate-snapshot`
- This ensures consistent time intervals for "last 7 days" or "last 30 days" comparisons

**Scraping can run as often as needed** (multiple times per day) without affecting snapshot consistency.

## Notes

- Server runs on port 3000 by default
- Frontend build output is copied to `public/gsp/` and served by backend
- The app is designed for Linux/Mac but should work on Windows (PowerShell or WSL)
- Database file: `data/gspro.db` (SQLite)

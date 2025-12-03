# AGENTS.md - GSPro Course Viewer

## Project Overview

This is a full-stack web application for viewing and exploring golf courses from **GSPro** (a golf simulator software). Course data is sourced from **SGT (Simulator Golf Tour)** at [simulatorgolftour.com](https://simulatorgolftour.com).

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          External Data Flow                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               ▼                               │
    │   ┌─────────────────────────────────────────────────────┐    │
    │   │            Course Scraper Server                     │    │
    │   │  (External - downloads GSPro courses, parses GKD     │    │
    │   │   resource files, uploads to this API)               │    │
    │   └─────────────────────────────────────────────────────┘    │
    │                               │                               │
    │                    POST /api/update-from-filesystem          │
    │                               │                               │
    └───────────────────────────────┼───────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Backend Server                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Elysia (Bun runtime)                                            │   │
│  │  - REST API for courses, course details, attributes              │   │
│  │  - SGT leaderboard scraping (proxied/transformed)                │   │
│  │  - Static file serving for frontend                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  SQLite Database (via Drizzle ORM)                               │   │
│  │  Tables: courses, tee_boxes, gk_data, tags, course_to_tags       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                              Serves frontend
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (React SPA)                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Vite + React + TypeScript + TanStack Query                      │   │
│  │  UI: Tailwind CSS + Radix UI (shadcn/ui components)              │   │
│  │  Routing: React Router                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend (`/src`)
- **Runtime**: Bun
- **Framework**: Elysia
- **Database**: SQLite with Drizzle ORM
- **Web Scraping**: Cheerio (for SGT leaderboard)
- **HTTP Client**: Axios
- **Logging**: Winston with daily rotate

### Frontend (`/frontend`)
- **Build Tool**: Vite
- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Routing**: React Router v6
- **Icons**: Lucide React

## Project Structure

```
/
├── src/                          # Backend source code
│   ├── index.ts                  # Database test/seed script
│   ├── server.ts                 # Elysia server entry point
│   ├── routes.ts                 # API route definitions
│   ├── course-data.ts            # Course data manipulation utilities
│   ├── course-data-types.ts      # Type definitions for course data
│   ├── teebox-data.ts            # Tee box data processing
│   ├── sgt-scraper.ts            # SGT leaderboard scraping
│   ├── logger.ts                 # Winston logger configuration
│   └── db/                       # Database layer
│       ├── db.ts                 # Database connection
│       ├── schema.ts             # Drizzle schema definitions
│       ├── migrate.ts            # Migration runner
│       └── migrations/           # SQL migration files
│
├── frontend/                     # Frontend source code
│   ├── src/
│   │   ├── main.tsx             # React entry point
│   │   ├── App.tsx              # App router setup
│   │   ├── index.css            # Global styles (Tailwind)
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── api/
│   │   │   └── useApi.ts        # API client functions
│   │   ├── contexts/
│   │   │   └── UnitContext.tsx  # Metric/Imperial unit context
│   │   ├── pages/
│   │   │   ├── CoursesPage.tsx  # Course list view
│   │   │   └── CoursePage.tsx   # Individual course detail view
│   │   ├── components/
│   │   │   ├── Layout.tsx           # App layout wrapper
│   │   │   ├── CourseCardView.tsx   # Course card grid
│   │   │   ├── GolfCourseViewer.tsx # Course detail viewer
│   │   │   ├── GolfHolePainter.tsx  # SVG hole visualization
│   │   │   ├── ScoreCard.tsx        # Scorecard modal
│   │   │   ├── AdvancedFilterPopup.tsx # Filter dialog
│   │   │   ├── CourseRecordsView.tsx   # SGT records display
│   │   │   ├── course-data.ts       # Course data utilities
│   │   │   ├── svg-generator.ts     # Hole SVG generation
│   │   │   └── ui/                  # shadcn/ui components
│   │   └── lib/
│   │       └── utils.ts         # Utility functions (cn)
│   ├── dist/                    # Built frontend (production)
│   └── public/                  # Static assets
│
├── data/
│   └── gspro.db                 # SQLite database file
│
├── public/
│   └── gsp/                     # Deployed frontend assets
│
├── logs/                        # Application logs
├── package.json                 # Backend dependencies
├── drizzle.config.ts           # Drizzle configuration
└── tsconfig.json               # TypeScript configuration
```

## Database Schema

### Tables

**courses** - Main course information
- `id`, `name`, `location`, `country`, `holes`, `par`, `designer`
- `altitude`, `grade`, `difficulty`, `graphics`, `golfQuality`
- `description`, `opcdName`, `opcdVersion`
- `addedDate`, `updatedDate`
- `sgtId`, `sgtSplashUrl`, `sgtYoutubeUrl`
- `isPar3`, `rangeEnabled`, `enabled`
- Computed metrics: `largestElevationDrop`, `averageElevationDifference`, `totalHazards`, `islandGreens`, `totalWaterHazards`, `totalInnerOOB`

**tee_boxes** - Tee box information per course
- `id`, `courseId`, `name`, `rating`, `slope`, `length`

**gk_data** - Raw GKD file data (JSON)
- `courseId`, `gkData` (JSON blob containing full course data including hole-by-hole details, hazards, pins)

**tags** - Course attribute tags
- `id`, `name` (e.g., "Links", "Coastal", "Mountain", "Desert")

**course_to_tags** - Many-to-many relationship
- `courseId`, `tagId`

## API Endpoints

### Public Endpoints (used by frontend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all enabled courses with tee boxes and tags |
| GET | `/api/courses/:id` | Get single course with GKD data |
| GET | `/api/course-attributes` | List all available course tags |
| GET | `/api/course-records/:sgtId/:teeType` | Fetch SGT leaderboard (scraped) |
| GET | `/api/courses/export-csv` | Export all courses as CSV |

### Internal/Admin Endpoints (used by course scraper)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/update-from-filesystem` | Upload/update course from GKD file |
| GET | `/api/course-sync-list` | Get course names for sync check |
| POST | `/api/courses/sync-with-sgt` | Enable/disable courses based on SGT manifest |
| GET | `/api/courses/update-course-data` | Recompute course metrics from GKD |

## Key Data Types

### CourseData (GKD file structure)
The GKD file is the GSPro course resource file containing:
- Course metadata (name, location, designer, altitude)
- Holes array with:
  - Par, index, enabled status
  - Tees array (Black, White, Blue, Yellow, Red, Green, Junior, Par3, plus aim points)
  - Pins array (different pin positions by day)
- Hazards array (water hazards, OOB areas, with polygon coordinates)
- Tee type total distances
- Slope/rating information per tee type

### Frontend Types (simplified)
```typescript
interface Course {
  id: number;
  name: string;
  location: string;
  designer: string;
  holes: number;
  par: number;
  altitude: number;
  teeBoxes: TeeBox[];
  attributes: CourseAttribute[];
  // ... elevation/hazard metrics
}

interface TeeBox {
  name: string;      // "Black", "Blue", "White", etc.
  length: number;    // Total yards
  rating: number;    // Course rating
  slope: number;     // Slope rating
}
```

## Frontend Features

### Courses List Page (`/courses`)
- **Search**: Filter by name, location, designer, holes
- **Sorting**: Alphabetical, updated date, tee length, altitude, rating, elevation, hazards
- **Advanced Filters**: Tee box length range, altitude range, par range, 18-hole only, par 3 only, driving range, course attributes
- **Lazy Loading**: IntersectionObserver-based infinite scroll
- **URL State**: Filters/sort persisted in URL params

### Course Card
- Course image from SGT
- Basic info (name, location, designer, holes/par)
- Tee boxes with color-coded badges showing length and rating/slope
- Quick access to scorecard modal and YouTube flyover

### Course Detail Page (`/course/:id`)
- Full course information header
- Selectable tee type and pin day
- Interactive hole selector
- **Hole Viewer**: SVG visualization showing:
  - Tee position
  - Aim points
  - Green center and pin
  - Hazards (water, OOB)
  - Distance markers with altitude/elevation adjustments
- **Scorecard Modal**: Traditional golf scorecard layout with all tees
- **Course Records Tab**: Live SGT leaderboard data

### Unit System
- Toggle between Imperial (yards/feet) and Metric (meters)
- Persisted via React Context

## Development

### Backend
```bash
# Install dependencies
bun install

# Run development server (with hot reload)
bun run dev

# Run database migrations
bun run migrate

# Generate new migrations
bun run db:generate

# Open Drizzle Studio (DB GUI)
bun run db:studio
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (copies to ../public/gsp/)
npm run build

# Run linter
npm run lint
```

## Data Flow

### Course Data Ingestion
1. External scraper downloads GSPro courses published on SGT
2. Parses GKD resource files to extract course metadata
3. Calls `POST /api/update-from-filesystem` with:
   - Course name
   - OPCD package info (version, dates)
   - SGT info (ID, splash image URL, YouTube URL)
   - Full GKD file contents
   - Computed par value
4. Server creates/updates course record, processes tee boxes, updates tags

### Course Sync with SGT
1. `POST /api/courses/sync-with-sgt` fetches SGT's `course_manifest.json`
2. Compares with database courses by SGT ID
3. Sets `enabled` flag - only courses in SGT manifest are shown to users

### SGT Leaderboard
1. Frontend requests `/api/course-records/:sgtId/:teeType`
2. Server scrapes `simulatorgolftour.com/Courses/Leaderboard?id=:sgtId&recordType=:teeType`
3. Parses HTML with Cheerio
4. Returns structured leaderboard data (player, score, attempts, country)

## Configuration

### Environment
- Server runs on port 3000
- Frontend uses `/gsp/` base path in production, `/` in development
- Database file: `data/gspro.db`

### Build Output
Frontend build copies to `public/gsp/` which is served by the backend's catch-all route serving `index.html` for SPA routing.

## Common Tasks

### Adding a new course attribute/tag
1. Insert into `tags` table
2. GKD file keyword flags (`KeywordLinks`, `KeywordCoastal`, etc.) are auto-mapped to tags during course update

### Updating course metrics
Run `GET /api/courses/update-course-data` to recompute all derived metrics (elevation, hazards) from stored GKD data.

### Debugging hole visualization
- SVG generation is in `frontend/src/components/svg-generator.ts`
- Course data utilities in `frontend/src/components/course-data.ts`
- Hazard filtering uses proximity to aim points/green

## Notes for AI Agents

1. **Course data is authoritative from GKD files** - The raw JSON stored in `gk_data` table is the source of truth for hole-level details

2. **SGT integration is passive** - We don't modify SGT, only read from it (leaderboards, course manifest)

3. **Unit conversion happens in frontend** - Backend stores all distances in metric units, frontend converts based on user preference

4. **Tee colors are standardized** - Black, White, Blue, Yellow, Red, Green, Junior, Par3 - colors are rendered via CSS based on name matching

5. **The SVG hole painter is approximate** - It visualizes the relative positions from GKD data but isn't a true-to-scale map

6. **Lazy loading is important** - With 1000+ courses, always consider performance implications when modifying the courses list


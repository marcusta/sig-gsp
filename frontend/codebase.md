# vite.config.ts

```ts
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/gspro-course-api": {
        target: "http://localhost:4445",
        changeOrigin: true,
      },
    },
  },
});

```

# tsconfig.node.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

# tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

# postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

# package.json

```json
{
  "name": "gsp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@tanstack/react-query": "^5.56.2",
    "@tanstack/react-query-devtools": "^5.56.2",
    "axios": "^1.7.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.441.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@tailwindcss/typography": "^0.5.15",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9",
    "globals": "^15.9.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.1",
    "vite": "^5.4.1"
  }
}

```

# index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

# eslint.config.js

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)

```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

# README.md

```md
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

\`\`\`js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
\`\`\`

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

\`\`\`js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
\`\`\`

```

# .gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

# .cursorrules

```
You are an expert software engineer. Code factoring is very important to you.

All typescript code should be well typed. 

We are using React with react-query and shadcn-ui. 

Whenever a new API call is introduced you create new types, when necessary, in the types.ts file and the API call uses that for reference

Follow the idiom of keeping "pages" and "components" and where data is fetched on the page level and components are concerned with rendering. Components should never do any react-queries/calls to server APIs 




```

# src/vite-env.d.ts

```ts
/// <reference types="vite/client" />

```

# src/types.ts

```ts
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Tee {
  TeeType: string;
  Enabled: boolean;
  Distance: number;
  Position: Position | null;
}

export interface Pin {
  Day: string;
  Position: Position;
}

export interface Hole {
  Enabled: boolean;
  HoleNumber: number;
  Par: number;
  Index: number;
  Tees: Tee[];
  Pins: Pin[];
}

export interface Hazard {
  pointCount: number;
  coords: Position[];
  DZpos: Position;
  freeDrop: boolean;
  innerOOB: boolean;
  noAIL: boolean;
  hasDZ: boolean;
  islandGreen: boolean;
}

export interface CourseData {
  gkversion: number;
  CourseName: string;
  Location: string;
  Homage: string;
  Designer: string;
  CourseImageFileName: string;
  ObjectTextureFileName: string;
  DescriptionTxtFileName: string;
  WindDirectionDefault: number;
  WindStrengthDefault: number;
  FairwayFirmnessDefault: number;
  GreenFirmnessDefault: number;
  DefaultStimp: number;
  MaxStimp: number;
  design: boolean;
  region: number;
  KeywordBeginnerFriendly: boolean;
  KeywordCoastal: boolean;
  KeywordDesert: boolean;
  KeywordFantasy: boolean;
  KeywordHeathland: boolean;
  KeywordHistoric: boolean;
  KeywordLinks: boolean;
  KeywordLowPoly: boolean;
  KeywordMajorVenue: boolean;
  KeywordMountain: boolean;
  KeywordParkland: boolean;
  KeywordTourStop: boolean;
  KeywordTraining: boolean;
  KeywordTropical: boolean;
  KeywordsString: string;
  unitOfMeasure: number;
  altitude: number;
  altitudeV2: number;
  BlackSR: string;
  WhiteSR: string;
  GreenSR: string;
  BlueSR: string;
  YellowSR: string;
  RedSR: string;
  JuniorSR: string;
  PAR3SR: string;
  terrainMaterial: number;
  hazardCount: number;
  slope: number;
  par: number;
  teeTypeCount: number;
  pOOB: OobDefinition;
  CourseInfo: string;
  Holes: Hole[];
  Hazards: Hazard[];
  TeeTypeTotalDistance: Tee[];
}

export interface OobDefinition {
  pointCount: number;
  coords: Position[];
}

export type NonTeeType = "AimPoint1" | "AimPoint2" | "GreenCenterPoint";

```

# src/main.tsx

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

# src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 120 40% 98%;
    --foreground: 120 10% 10%;

    --card: 0 0% 100%;
    --card-foreground: 120 10% 10%;

    --popover: 0 0% 100%;
    --popover-foreground: 120 10% 10%;

    --primary: 142 76% 36%;
    --primary-foreground: 355.7 100% 97.3%;

    --secondary: 120 40% 96.1%;
    --secondary-foreground: 120 10% 10%;

    --muted: 120 40% 96.1%;
    --muted-foreground: 120 10% 40%;

    --accent: 142 76% 36%;
    --accent-foreground: 355.7 100% 97.3%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 120 20% 90%;
    --input: 120 20% 90%;
    --ring: 142 76% 36%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 120 40% 5%;
    --foreground: 120 10% 98%;

    --card: 120 40% 5%;
    --card-foreground: 120 10% 98%;

    --popover: 120 40% 5%;
    --popover-foreground: 120 10% 98%;

    --primary: 142 76% 36%;
    --primary-foreground: 355.7 100% 97.3%;

    --secondary: 120 40% 10%;
    --secondary-foreground: 120 10% 98%;

    --muted: 120 40% 10%;
    --muted-foreground: 120 10% 60%;

    --accent: 142 76% 36%;
    --accent-foreground: 355.7 100% 97.3%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;

    --border: 120 40% 10%;
    --input: 120 40% 10%;
    --ring: 142 76% 36%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

# src/App.tsx

```tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Layout from "./components/Layout";
import FormView from "./components/FormView";
import CardView from "./components/CardView";
import GolfCourseViewer from "./components/GolfCourseViewer";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<GolfCourseViewer />} />
            <Route path="form" element={<FormView />} />
            <Route path="cards" element={<CardView />} />
          </Route>
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;

```

# src/App.css

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```

# public/vite.svg

This is a file of the type: SVG Image

# src/lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

# src/components/svg-generator.ts

```ts
import type { Hazard, Pin, Position, Tee } from "@/types";
import { calculatePlaysAsDistance, distance3D } from "./course-data";

export function generateSVG(
  selectedTee: Tee,
  selectedPin: Pin,
  aimPoint1: Tee | null,
  aimPoint2: Tee | null,
  greenCenterPoint: Tee | null,
  altitudeEffect: number,
  hazards: Hazard[]
): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 800 600");
  svg.style.maxWidth = "100%";
  svg.style.maxHeight = "100%";

  const clipPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "clipPath"
  );
  clipPath.setAttribute("id", "panel-clip");
  const clipRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  clipRect.setAttribute("x", "0");
  clipRect.setAttribute("y", "0");
  clipRect.setAttribute("width", "800");
  clipRect.setAttribute("height", "600");
  clipPath.appendChild(clipRect);
  svg.appendChild(clipPath);

  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  mainGroup.setAttribute("clip-path", "url(#panel-clip)");
  svg.appendChild(mainGroup);

  const positions = [
    selectedTee,
    selectedPin,
    aimPoint1,
    aimPoint2,
    greenCenterPoint,
  ]
    .filter(
      (point): point is Tee | Pin => point !== null && point.Position !== null
    )
    .map((point) => ({ x: point.Position!.x, z: point.Position!.z }));

  const { minX, maxX, minZ, maxZ } = calculateBoundaries(positions);
  const { transformX, transformZ, scale } = createTransformFunctions(
    minX,
    maxX,
    minZ,
    maxZ
  );

  const rotation = calculateRotation(
    selectedTee.Position!,
    selectedPin.Position
  );
  mainGroup.setAttribute("transform", `rotate(${rotation} 400 300)`);

  drawWaterHazards(mainGroup, hazards, transformX, transformZ);
  drawTee(mainGroup, selectedTee, transformX, transformZ);
  drawPin(mainGroup, selectedPin, transformX, transformZ);
  drawPath(
    svg,
    mainGroup,
    selectedTee,
    selectedPin,
    aimPoint1,
    aimPoint2,
    transformX,
    transformZ,
    altitudeEffect,
    scale,
    rotation
  );
  drawGreenArea(mainGroup, greenCenterPoint, transformX, transformZ);

  return svg;
}

// Helper functions
function calculateBoundaries(positions: { x: number; z: number }[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  const padding = 50;
  const minX = Math.min(...positions.map((p) => p.x)) - padding;
  const maxX = Math.max(...positions.map((p) => p.x)) + padding;
  const minZ = Math.min(...positions.map((p) => p.z)) - padding;
  const maxZ = Math.max(...positions.map((p) => p.z)) + padding;
  return { minX, maxX, minZ, maxZ };
}

function createTransformFunctions(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): {
  transformX: (x: number) => number;
  transformZ: (z: number) => number;
  scale: number;
} {
  const width = 800;
  const height = 600;
  const xRange = maxX - minX;
  const zRange = maxZ - minZ;
  const scale = Math.min(width / xRange, height / zRange) * 0.8;

  return {
    transformX: (x: number) =>
      (x - minX) * scale + (width - xRange * scale) / 2,
    transformZ: (z: number) =>
      height - ((z - minZ) * scale + (height - zRange * scale) / 2),
    scale: scale,
  };
}

function calculateRotation(
  teePosition: Position,
  pinPosition: Position
): number {
  const angle = Math.atan2(
    pinPosition.z - teePosition.z,
    pinPosition.x - teePosition.x
  );
  return ((angle * 180) / Math.PI - 90) % 360;
}

function drawTee(
  svg: SVGElement,
  selectedTee: Tee,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  const teeCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  teeCircle.setAttribute("cx", transformX(selectedTee.Position!.x).toString());
  teeCircle.setAttribute("cy", transformZ(selectedTee.Position!.z).toString());
  teeCircle.setAttribute("r", "5");
  teeCircle.setAttribute("fill", "#000000");
  svg.appendChild(teeCircle);
}

function drawPin(
  svg: SVGElement,
  selectedPin: Pin,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  const pinCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  pinCircle.setAttribute("cx", transformX(selectedPin.Position.x).toString());
  pinCircle.setAttribute("cy", transformZ(selectedPin.Position.z).toString());
  pinCircle.setAttribute("r", "3");
  pinCircle.setAttribute("fill", "#FF0000");
  svg.appendChild(pinCircle);
}

function drawPath(
  svg: SVGSVGElement,
  mainGroup: SVGGElement,
  selectedTee: Tee,
  selectedPin: Pin,
  aimPoint1: Tee | null,
  aimPoint2: Tee | null,
  transformX: (x: number) => number,
  transformZ: (z: number) => number,
  altitudeEffect: number,
  scale: number,
  rotation: number
): void {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let pathData = `M ${transformX(selectedTee.Position!.x)} ${transformZ(
    selectedTee.Position!.z
  )}`;
  let lastPoint = selectedTee.Position!;

  if (aimPoint1 && aimPoint1.Position) {
    lastPoint = drawLineWithDistance(
      svg,
      lastPoint,
      aimPoint1.Position,
      "",
      transformX,
      transformZ,
      altitudeEffect,
      scale,
      rotation
    );
    pathData += ` L ${transformX(aimPoint1.Position.x)} ${transformZ(
      aimPoint1.Position.z
    )}`;
  }
  if (aimPoint2 && aimPoint2.Position) {
    lastPoint = drawLineWithDistance(
      svg,
      lastPoint,
      aimPoint2.Position,
      "",
      transformX,
      transformZ,
      altitudeEffect,
      scale,
      rotation
    );
    pathData += ` L ${transformX(aimPoint2.Position.x)} ${transformZ(
      aimPoint2.Position.z
    )}`;
  }
  drawLineWithDistance(
    svg,
    lastPoint,
    selectedPin.Position,
    "",
    transformX,
    transformZ,
    altitudeEffect,
    scale,
    rotation
  );
  pathData += ` L ${transformX(selectedPin.Position.x)} ${transformZ(
    selectedPin.Position.z
  )}`;

  path.setAttribute("d", pathData);
  path.setAttribute("stroke", "#000000");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("fill", "none");
  path.setAttribute("id", "golf-hole-path");
  mainGroup.appendChild(path);
}

function drawLineWithDistance(
  svg: SVGSVGElement,
  point1: Position,
  point2: Position,
  label: string,
  transformX: (x: number) => number,
  transformZ: (z: number) => number,
  altitudeEffect: number,
  scale: number,
  rotation: number
): Position {
  const dist = distance3D(point1, point2);
  const elevationChange = point2.y - point1.y;
  const playsAsDistance = calculatePlaysAsDistance(
    dist,
    elevationChange,
    altitudeEffect
  );

  const x1 = transformX(point1.x);
  const y1 = transformZ(point1.z);
  const x2 = transformX(point2.x);
  const y2 = transformZ(point2.z);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const rotatedMid = rotatePoint(midX, midY, rotation, 400, 300);

  const elevationText =
    elevationChange > 0
      ? `+${elevationChange.toFixed(1)}m`
      : `${elevationChange.toFixed(1)}m`;

  const tspan1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan1.textContent = `${label}${dist.toFixed(1)}m (${elevationText})`;
  tspan1.setAttribute("x", rotatedMid.x.toString());
  tspan1.setAttribute("dy", "0em");

  const tspan2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan2.textContent = `Plays as: ${playsAsDistance.toFixed(1)}m`;
  tspan2.setAttribute("x", rotatedMid.x.toString());
  tspan2.setAttribute("dy", "1.2em");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", rotatedMid.x.toString());
  text.setAttribute("y", rotatedMid.y.toString());
  text.setAttribute("font-size", Math.max(10, 12 / scale).toString());
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("fill", "#000000");
  text.appendChild(tspan1);
  text.appendChild(tspan2);

  svg.appendChild(text);

  return point2;
}

function rotatePoint(
  x: number,
  y: number,
  angle: number,
  cx: number,
  cy: number
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  const xRot = dx * cos - dy * sin + cx;
  const yRot = dx * sin + dy * cos + cy;
  return { x: xRot, y: yRot };
}

function drawGreenArea(
  svg: SVGElement,
  greenCenterPoint: Tee | null,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  if (greenCenterPoint && greenCenterPoint.Position) {
    const greenCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    greenCircle.setAttribute(
      "cx",
      transformX(greenCenterPoint.Position.x).toString()
    );
    greenCircle.setAttribute(
      "cy",
      transformZ(greenCenterPoint.Position.z).toString()
    );
    greenCircle.setAttribute("r", "30");
    greenCircle.setAttribute("fill", "#90EE90");
    greenCircle.setAttribute("fill-opacity", "0.5");
    svg.appendChild(greenCircle);
  }
}

function drawWaterHazards(
  svg: SVGElement,
  hazards: Hazard[],
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  hazards.forEach((hazard) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = "";

    hazard.coords.forEach((coord, index) => {
      const x = transformX(coord.x);
      const z = transformZ(coord.z);
      pathData += index === 0 ? `M ${x} ${z}` : ` L ${x} ${z}`;
    });

    pathData += " Z";
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "#87CEFA");
    path.setAttribute("fill-opacity", "0.5");
    path.setAttribute("stroke", "#4682B4");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
  });
}

```

# src/components/course-data.ts

```ts
import type {
  CourseData,
  Hazard,
  Hole,
  NonTeeType,
  Pin,
  Position,
  Tee,
} from "@/types";

export interface AvailableTee {
  TeeType: string;
  TotalDistance: number;
}

export function calculateAltitudeEffect(
  courseData: CourseData | number
): number {
  const altitudeFeet =
    typeof courseData === "number" ? courseData : getAltitude(courseData);
  const altitudeEffect = 1 - (0.02 * altitudeFeet) / 1000;
  return altitudeEffect;
}

export function getTotalPar(courseData: CourseData): number {
  return courseData.Holes.reduce((sum, hole) => sum + hole.Par, 0);
}

export function getAltitude(courseData: CourseData): number {
  return courseData.altitudeV2 || courseData.altitude || 0;
}

export function getHole(courseData: CourseData, holeNumber: number): Hole {
  return courseData.Holes[holeNumber - 1];
}

export function getTee(
  courseData: CourseData,
  holeNumber: number,
  teeType: string
): Tee | null {
  const hole = getHole(courseData, holeNumber);
  const tee = hole.Tees.find((tee) => tee.TeeType === teeType);
  return tee || null;
}

export function getPin(
  courseData: CourseData,
  holeNumber: number,
  pinDay: string
): Pin | null {
  const hole = getHole(courseData, holeNumber);
  const pin = hole.Pins.find((pin) => pin.Day === pinDay);
  return pin || null;
}

export function getAimOrGreenPoint(
  courseData: CourseData,
  holeNumber: number,
  pointType: NonTeeType
): Tee | null {
  return getTee(courseData, holeNumber, pointType);
}

export function getAvailableTees(courseData: CourseData): AvailableTee[] {
  return courseData.Holes[0].Tees.filter((tee) => tee.Position !== null)
    .map((tee) => ({
      TeeType: tee.TeeType,
      TotalDistance: courseData.Holes.reduce((sum, hole) => {
        const teebox = hole.Tees.find((t) => t.TeeType === tee.TeeType);
        return sum + (teebox ? teebox.Distance : 0);
      }, 0),
    }))
    .filter(
      (tee) =>
        tee.TeeType !== "AimPoint1" &&
        tee.TeeType !== "AimPoint2" &&
        tee.TeeType !== "GreenCenterPoint"
    )
    .sort((a, b) => b.TotalDistance - a.TotalDistance);
}

export function distance3D(point1: Position, point2: Position): number {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2) +
      Math.pow(point1.z - point2.z, 2)
  );
}

export function calculateAdjustedDistance3D(
  point1: Position,
  point2: Position,
  altitudeEffect: number
): number {
  const distance = distance3D(point1, point2);
  const elevationChange = calculateElevationChange(point1, point2);
  return calculatePlaysAsDistance(distance, elevationChange, altitudeEffect);
}

export function calculateElevationChange(
  point1: Position,
  point2: Position
): number {
  return point2.y - point1.y;
}

export function calculatePlaysAsDistance(
  distance: number,
  elevationChange: number,
  altitude: number
): number {
  const altitudeEffect = calculateAltitudeEffect(altitude);
  const altitudeAdjustedDistance =
    (distance + elevationChange) * altitudeEffect;
  return altitudeAdjustedDistance;
}

export function getHazards(
  courseData: CourseData,
  holeNumber: number
): Hazard[] {
  const holePoints = [
    getTee(courseData, holeNumber, "AimPoint1"),
    getTee(courseData, holeNumber, "AimPoint2"),
    getTee(courseData, holeNumber, "GreenCenterPoint"),
    getPin(courseData, holeNumber, "Day1"),
  ];
  const hazards = courseData.Hazards.filter((hazard) =>
    isHazardNearHole(hazard, holePoints)
  );
  return hazards;
}

export function isHazardNearHole(
  hazard: Hazard,
  holePoints: (Tee | Pin | null)[]
): boolean {
  const MAX_DISTANCE = 50;

  for (const point of holePoints) {
    if (!point || !point.Position) continue;

    for (const coord of hazard.coords) {
      const distance = distance3D(point.Position, coord);
      if (distance <= MAX_DISTANCE) {
        return true;
      }
    }
  }

  return false;
}

```

# src/components/Layout.tsx

```tsx
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600">
      <header className="bg-white bg-opacity-10 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-foreground">
              Golf App
            </h1>
            <ul className="flex space-x-4">
              <li>
                <Link
                  to="/"
                  className="text-primary-foreground hover:text-white"
                >
                  View course
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

```

# src/components/GolfHolePainter.tsx

```tsx
import React, { useEffect, useRef } from "react";
import type { CourseData } from "@/types";
import { generateSVG } from "./svg-generator";
import {
  calculateAltitudeEffect,
  getAimOrGreenPoint,
  getHazards,
  getPin,
  getTee,
} from "./course-data";

interface GolfCourseProps {
  courseData: CourseData;
  selectedHoleNumber: number;
  selectedTeeType: string;
  selectedPinDay: string;
}

const GolfHolePainter: React.FC<GolfCourseProps> = ({
  courseData,
  selectedHoleNumber,
  selectedTeeType,
  selectedPinDay,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!courseData) return;
    const selectedTee = getTee(courseData, selectedHoleNumber, selectedTeeType);
    const selectedPin = getPin(courseData, selectedHoleNumber, selectedPinDay);
    const aimPoint1 = getAimOrGreenPoint(
      courseData,
      selectedHoleNumber,
      "AimPoint1"
    );
    const aimPoint2 = getAimOrGreenPoint(
      courseData,
      selectedHoleNumber,
      "AimPoint2"
    );
    const greenCenterPoint = getAimOrGreenPoint(
      courseData,
      selectedHoleNumber,
      "GreenCenterPoint"
    );
    const altitudeEffect = calculateAltitudeEffect(courseData);
    const hazards = getHazards(courseData, selectedHoleNumber);

    if (svgRef.current !== null && selectedTee && selectedPin) {
      const svgElement = generateSVG(
        selectedTee,
        selectedPin,
        aimPoint1,
        aimPoint2,
        greenCenterPoint,
        altitudeEffect,
        hazards
      );

      // Clear existing content
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      // Append new content
      while (svgElement.firstChild) {
        svgRef.current.appendChild(svgElement.firstChild);
      }

      // Copy attributes
      Array.from(svgElement.attributes).forEach((attr) => {
        svgRef.current!.setAttribute(attr.name, attr.value);
      });
    }
  }, [courseData, selectedHoleNumber, selectedTeeType, selectedPinDay]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        top: "-50px",
      }}
    >
      <svg ref={svgRef} />
    </div>
  );
};

export default GolfHolePainter;

```

# src/components/GolfCourseViewer.tsx

```tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GolfHolePainter from "./GolfHolePainter";
import { fetchCourseData } from "@/api/useApi";
import { useQuery } from "@tanstack/react-query";
import type { CourseData } from "@/types";
import {
  calculateElevationChange,
  calculatePlaysAsDistance,
  getAltitude,
  getHole,
  getPin,
  getTee,
} from "./course-data";

const GolfCourseViewer: React.FC = () => {
  const [currentHoleNumber, setCurrentHoleNumber] = useState(1);
  const [selectedTeeType, setSelectedTeeType] = useState<string>("Black");
  const [selectedPinDay, setSelectedPinDay] = useState<string>("Friday");

  const { data: courseData, isLoading: courseDataLoading } = useQuery<
    CourseData,
    Error
  >({
    queryKey: ["courseData"],
    queryFn: fetchCourseData,
  });

  if (courseDataLoading) {
    return <div>Loading...</div>;
  }

  if (!courseData) {
    return <div>No course data available</div>;
  }

  const courseAltitude = getAltitude(courseData);
  const currentHole = getHole(courseData, currentHoleNumber);
  const holePar = currentHole.Par;
  const holeIndex = currentHole.Index;
  const currentPin = getPin(courseData, currentHoleNumber, selectedPinDay);
  const currentTee = getTee(courseData, currentHoleNumber, selectedTeeType);
  if (!currentTee || !currentPin) {
    return <div>No tee or pin data available</div>;
  }
  const holeDistance = currentTee.Distance;
  const holeElevation = calculateElevationChange(
    currentTee.Position!,
    currentPin.Position
  );
  const holePlaysAsDistance = calculatePlaysAsDistance(
    holeDistance,
    holeElevation,
    courseAltitude
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 space-y-2">
        {courseData.Holes.map((hole, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold"
            onClick={() => setCurrentHoleNumber(hole.HoleNumber)}
          >
            {hole.HoleNumber}
          </div>
        ))}
      </div>
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Hole {currentHoleNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-[300px]">
            <p>
              Par: {holePar} Index: {holeIndex}
            </p>
            <p>Distance: {holeDistance.toFixed(0)}m</p>
            <p>Plays as: {holePlaysAsDistance.toFixed(0)}m</p>
            <p>Elevation: {holeElevation.toFixed(1)}m</p>
          </div>
          <GolfHolePainter
            courseData={courseData}
            selectedHoleNumber={currentHoleNumber}
            selectedTeeType={selectedTeeType}
            selectedPinDay={selectedPinDay}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GolfCourseViewer;

```

# src/components/FormView.tsx

```tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FormView: React.FC = () => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Player Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div>
            <Label htmlFor="handicap">Handicap</Label>
            <Input
              id="handicap"
              type="number"
              placeholder="Enter your handicap"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormView;

```

# src/components/Dashboard.tsx

```tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 space-y-2">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Hole 9</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Par: 4 Index: 9</p>
          <p>Distance: 365m, 355m</p>
          <p>Plays as: 361m, 351m</p>
          <p>Elevation: -3.7m</p>
          <div className="mt-4 h-64 bg-green-200 rounded-lg relative">
            <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-green-600 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-black rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

```

# src/components/CardView.tsx

```tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CardView: React.FC = () => {
  const holes = [
    { number: 1, par: 4, distance: 380 },
    { number: 2, par: 3, distance: 175 },
    { number: 3, par: 5, distance: 520 },
    { number: 4, par: 4, distance: 410 },
    { number: 5, par: 3, distance: 200 },
    { number: 6, par: 4, distance: 395 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {holes.map((hole) => (
        <Card key={hole.number}>
          <CardHeader>
            <CardTitle>Hole {hole.number}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Par: {hole.par}</p>
            <p>Distance: {hole.distance}m</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardView;

```

# src/assets/react.svg

This is a file of the type: SVG Image

# src/api/useApi.ts

```ts
import type { CourseData } from "@/types";
import axios from "axios";

const api = axios.create({ baseURL: "/gspro-course-api" });

export const fetchCourseData = () =>
  api.get<CourseData>("/courses/10/gkd").then((res) => res.data);

```

# src/components/ui/label.tsx

```tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

# src/components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

# src/components/ui/card.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

```

# src/components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```


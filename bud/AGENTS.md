# Repository Guidelines

## Project Structure & Module Organization

Bud is a mobile-first lost pet tracker prototype built with Vite, React, TypeScript, Tailwind CSS, and Supabase. Application code lives in `src/`: reusable UI is in `src/components`, screen-level views are in `src/screens`, shared state is in `src/context`, static pet seed data is in `src/data`, and service clients are in `src/lib`. Global styles are in `src/index.css`, the app entry is `src/main.tsx`, and the root shell is `src/App.tsx`. Public static assets belong in `public/`. Supabase database setup is tracked in `supabase_schema.sql`.

## Build, Test, and Development Commands

Install dependencies with:

```bash
npm install
```

Run the local development server with hot reload:

```bash
npm run dev
```

Create a production build and run TypeScript project checks:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

## Coding Style & Naming Conventions

Use TypeScript and React function components. Keep component files in PascalCase, such as `BottomNav.tsx`, and use camelCase for functions, variables, and callbacks. Prefer named exports for shared components and context helpers unless the surrounding file already uses a default export. Follow the existing two-space indentation style, double quotes, semicolons, and Tailwind utility classes for styling. Keep Tailwind theme tokens in `tailwind.config.js` and use existing `bud.*` colors before adding new palette values.

## Testing Guidelines

No test framework is currently configured. Until one is added, run `npm run build` before submitting changes to catch TypeScript and bundling errors. For future tests, prefer colocated component tests near the feature they cover or a `src/__tests__/` directory, and name files with `.test.ts` or `.test.tsx`. Focus tests on navigation behavior, Supabase data boundaries, form validation, and map/report workflows.

## Commit & Pull Request Guidelines

Recent commits use short imperative or descriptive subjects, for example `MVP` and `Initial commit: Bud lost pet tracker UI prototype`. Keep commit subjects concise and focused on one change. Pull requests should include a brief summary, testing performed, linked issue or task when available, and screenshots or screen recordings for UI changes. Note any required environment variables or database migration steps.

## Security & Configuration Tips

Keep local secrets out of git. Use `.env.local` for private values such as `VITE_GOOGLE_MAPS_API_KEY` and Supabase credentials. Document any new required environment variable in `README.md`, and avoid committing generated folders such as `dist/` or `node_modules/`.

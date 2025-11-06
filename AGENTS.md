# Repository Guidelines

## Project Structure & Module Organization
The Vue 3 + TypeScript source lives in `src/`. `views/` holds routed pages, `components/` stores reusable blocks, and `router/index.ts` wires routes. Static styling sits in `src/assets` alongside seed CSS, while playlist data is read from `src/data/songs.json` (mirrored to CSV by scripts). Published artifacts deploy to `docs/` for GitHub Pages, and raw assets such as favicons and QR codes belong in `public/`. Automation helpers live under `scripts/` (Node for Aztec code generation, Python for Spotify and CSV transforms).

## Build, Test, and Development Commands
Install JavaScript deps with `pnpm install` and Python tooling via `pip install -r requirements.txt` if you touch data scripts. Use `pnpm dev` for hot-reload development, `pnpm preview` to smoke-test the production bundle locally, and `pnpm build` for the release build (copies `docs/index.html` to `docs/404.html`). Run `pnpm type-check` before pushing to catch TS and `.vue` typing issues, and `pnpm lint`/`pnpm format` to apply ESLint + Prettier rules. Regenerate placeholder song data with `pnpm gen:data` or refresh playlists using `python scripts/fetch_spotify_playlist.py`.

## Coding Style & Naming Conventions
Follow the default ESLint flat config (`eslint.config.ts`) with Vue essential rules; components stay in `<script setup lang="ts">` format with 2-space indentation. Use `PascalCase` for components, `camelCase` for functions and composables, and kebab-case file names inside `components/` and `views/`. Keep CSS co-located in `src/assets/*.css` and favor CSS variables already defined there. Always rerun `pnpm lint` after larger refactors to avoid inconsistent formatting.

## Testing Guidelines
Automated tests are not yet wired; rely on `pnpm type-check`, manual UI verification through `pnpm dev`, and `pnpm build` to confirm the static export. When adding tests, create a `tests/` or `src/__tests__/` module and name files `<feature>.spec.ts`. Mirror browser-state scenarios (e.g., `localStorage` flags) with explicit mocks so the next contributor can reproduce edge cases. Document new verification steps in the PR description.

## Commit & Pull Request Guidelines
Commit messages in history are concise sentence fragments, frequently in Japanese; match that tone with present-tense summaries (e.g., `"homeViewデザイン反映"`) and group logical changes per commit. Ensure each PR describes the user-facing impact, lists relevant commands run (`pnpm build`, scripts touched), and links to issues or design references when available. Capture UI changes with screenshots or screen recordings. Request at least one review when altering `src/data/songs.*` or deployment assets, and confirm Spotify credentials stay out of source control.

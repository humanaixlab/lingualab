# Changelog

## 2.0.0-rc.1 — 2026-07-15

### Added
- Guided Arabic dataset workspace with CSV, TSV, and XLSX support.
- Dataset understanding, classification and corpus-exploration workflows.
- Research insights and downloadable HTML report.
- ESLint production quality gate and combined `npm run check` command.
- Security headers and environment-variable template.

### Changed
- Repositioned LinguaLab as an AI workspace for Arabic language.
- Upgraded Next.js to 16.2.10 and React to 19.2.4.
- Replaced the vulnerable legacy Excel dependency with `read-excel-file`.
- Hardened OpenAI API endpoints with configuration checks and input limits.

### Removed
- Unused Firebase and Supabase scaffolding.
- Unused WebSocket dependency.
- Old backup routes and duplicate root files.

### Fixed
- Broken dashboard links.
- Lint error in persisted student progress.
- Production behavior when `OPENAI_API_KEY` is absent.

### Repository preparation
- Added a comprehensive README, architecture documentation, security policy, contribution guide, MIT license, issue templates, product preview, social preview, and favicon.
- Updated project metadata and documented the human-led, AI-assisted development workflow.

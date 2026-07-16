# AI Research Advisor — Stage 1

## Added
- `/research-advisor`: a focused research-planning experience.
- `/api/research-advisor`: server-side OpenAI Responses API route.
- Preview fallback when `OPENAI_API_KEY` is unavailable.
- `/smart-home` now preserves the old URL and renders the new advisor.

## Validation performed here
- `node --check pages/api/research-advisor.js`
- `node --check pages/research-advisor.js`
- `node --check pages/smart-home.js`
- `git diff --check` on the four stage files

## Required local validation before commit
```bash
pnpm install
pnpm lint
pnpm build
```

The remote package registry was unavailable in the editing environment, so dependencies could not be installed and the full lint/build commands could not run here.

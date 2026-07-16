# Architecture

LinguaLab uses the Next.js Pages Router and separates the privacy-first browser workflow from optional server-side AI assistance.

## Core flow

1. The user opens `/workspace`.
2. CSV, TSV, or XLSX data is parsed in the browser.
3. Dataset understanding detects likely text and label columns, missing values, Arabic-script coverage, duplicates, and class distribution.
4. A guided workflow selects either:
   - a text-classification baseline when labels exist; or
   - corpus exploration when the dataset is unlabeled.
5. Results are interpreted into specific insights.
6. A self-contained HTML research report is generated for download and printing to PDF.

## Optional AI endpoints

- `/api/analyze-ai` provides text-analysis assistance.
- `/api/code-ai` provides code assistance.

Both endpoints keep `OPENAI_API_KEY` server-side, validate input size, and return a safe configuration response when the key is absent.

## Privacy boundary

The dataset workspace runs locally in the browser. A user's uploaded file is not transmitted to the application server. This boundary is deliberate and should be preserved in future changes.

## Main directories

```text
components/       Shared interface components
pages/            Routes and API endpoints
public/           Demo datasets and public assets
styles/           Page-level and global CSS
docs/             Architecture and project documentation
```

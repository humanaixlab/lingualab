# LinguaLab 2.0 — Test Results

**Release:** 2.0.0-rc.1  
**Latest verification:** 15 July 2026

## Passed

- Clean dependency installation from `package-lock.json`.
- ESLint completed with zero errors and zero warnings.
- Next.js 16 production build completed successfully.
- Home page and `/workspace` returned HTTP 200 under the production server.
- Security headers were present on runtime responses.
- CSV and TSV parsing succeeded.
- Modern XLSX parsing succeeded with Arabic text preserved.
- Legacy `.xls` is rejected with a clear conversion message.
- Dataset understanding detected likely `text` and `label` columns.
- Demo Arabic-script detection reached 100%.
- Demo label distribution was balanced: 10 positive, 10 neutral, and 10 negative.
- Stratified training/test split produced 21 training and 9 testing records.
- Demo classification baseline produced 77.8% test accuracy.
- Corpus exploration returned document, token, vocabulary, frequency, and bigram statistics.
- Insight generation produced dataset- and result-specific observations.
- Research report included summary, methodology, results, insights, limitations, and next steps.
- Report HTML was suitable for browser printing to PDF.
- `npm audit` reported zero known vulnerabilities during the production-readiness audit.

## Fixed during testing

- Replaced the original small demo sample that produced an unstable result with a balanced 30-record dataset.
- Replaced the global deterministic split with a class-aware stratified split.
- Removed the vulnerable legacy `xlsx` dependency and adopted `read-excel-file`.
- Added decoding for Arabic character references returned by some Excel documents.
- Upgraded to supported Next.js and React releases.
- Hardened AI endpoints for missing configuration and oversized input.

## Final deployment checks

The Vercel milestone must still confirm:

1. the complete workflow in a normal public browser;
2. mobile layout and touch interaction;
3. production OpenAI endpoint behavior and account limits;
4. report download from the deployed origin;
5. real screenshots from the public URL.

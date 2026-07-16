# Excel upload fix

- Removed the vulnerable `xlsx` dependency.
- Added `read-excel-file` for modern `.xlsx` files.
- CSV and TSV remain supported.
- Legacy `.xls` is intentionally rejected with a conversion message.
- Added decoding for Arabic numeric character references returned by some Excel files.
- Verified with `public/sample-datasets/arabic_reviews_demo.xlsx`.
- Production compilation and static page generation completed successfully.

# Security Policy

## Supported version

LinguaLab is currently in release-candidate development. Security fixes are applied to the latest `2.x` release candidate.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Contact the project owner privately through the email address associated with the GitHub account that publishes this repository.

Include:

- the affected route or component;
- steps to reproduce;
- the expected and observed behavior;
- any evidence that helps confirm the issue.

## Data handling

Dataset parsing and the guided baseline analysis run in the browser. Uploaded CSV, TSV, and XLSX files are not sent to LinguaLab's server by the workspace workflow. Calls to the optional AI endpoints send only the text explicitly submitted to those tools.

Never commit `.env.local` or an OpenAI API key. Server-side secrets must be configured in the deployment environment.

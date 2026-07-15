# Contributing to LinguaLab

LinguaLab is currently focused on a stable competition release. Small, well-scoped fixes are welcome.

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Before opening a pull request

```bash
npm run check
```

A pull request should:

- explain the user problem being solved;
- keep Arabic text handling intact;
- avoid sending uploaded datasets to a remote server;
- include a focused test or clear manual verification steps;
- avoid unrelated formatting or dependency changes.

## Product principle

Every addition should help the user **build, analyze, learn, or discover** with Arabic language data.

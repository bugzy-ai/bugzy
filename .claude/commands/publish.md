---
name: publish
description: Bump version, publish to the registry, and push to git
---

# Publish Command

This command handles the complete release process for the bugzy package.

Additional instructions: $ARGUMENTS

## What it does:
1. Determines the version bump type (patch, minor, major) based on changes
2. Updates version in package.json using `npm version patch|minor|major --no-git-tag-version`
3. Builds the package using `pnpm build`
4. Publishes to GitHub Packages using `node scripts/publish.js`
5. Commits the changes
6. Pushes to the remote repository

## IMPORTANT: Publishing to GitHub Packages

**Do NOT use `npm publish` directly.** Always use the custom publish script:

```bash
node scripts/publish.js
```

This script:
- Loads `GITHUB_TOKEN` from `.env.local` or `.env`
- Validates the token is present
- Runs `pnpm publish --no-git-checks`

**Prerequisites:**
- Ensure `GITHUB_TOKEN` is set in `.env` or `.env.local`
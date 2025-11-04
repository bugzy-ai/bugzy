---
name: publish
description: Bump version, publish to the registry, and push to git
---

# Publish Command

This command handles the complete release process for the bugzy package.

Additional instructions: $ARGUMENTS

## What it does:
1. Determines the version bump type (patch, minor, major) based on changes
2. Updates version in package.json
4. Builds the package
5. Publishes to registry
6. Commits the changes
8. Pushes to the remote repository
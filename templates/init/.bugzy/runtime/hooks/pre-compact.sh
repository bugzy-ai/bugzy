#!/usr/bin/env bash
# PreCompact Hook — Flush insights before context compaction
# This script runs automatically before Claude Code compacts context.
# Its stdout is injected into the conversation, instructing Claude to save learnings.

set -euo pipefail

RUNTIME_DIR=".bugzy/runtime"
LOGS_DIR="$RUNTIME_DIR/logs"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$LOGS_DIR/$TODAY.md"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

cat <<'INSTRUCTIONS'
=== PRE-COMPACTION: Save Your Learnings ===

Context compaction is about to happen. Before your context is compressed, extract and save any knowledge from this session that matches the categories below.

**Write entries to the daily log file** using the Write tool:
INSTRUCTIONS

echo "**Daily log path:** \`$LOG_FILE\`"

cat <<'INSTRUCTIONS'

**Format each entry as:**
```markdown
### HH:MM — {source-role-or-task}
<!-- source: {task-or-subagent} -->
- Insight or pattern learned
- Another insight
```

**Extraction Categories (save only what applies):**
- **Application patterns** — UI flows, navigation, API response patterns
- **Test reliability** — Flaky selectors, timing issues, retry patterns
- **Team preferences** — Communication style, workflow expectations
- **Technical constraints** — Rate limits, auth lifetimes, deployment gotchas
- **Environment facts** — URLs, test data patterns, feature flags

**Include provenance** on each entry. Only save knowledge that would help in future sessions.
INSTRUCTIONS

# Inject the full maintenance guide for reference
if [ -f "$RUNTIME_DIR/knowledge-maintenance-guide.md" ]; then
  echo ""
  echo "=== Knowledge Maintenance Guide (Reference) ==="
  cat "$RUNTIME_DIR/knowledge-maintenance-guide.md"
fi

exit 0

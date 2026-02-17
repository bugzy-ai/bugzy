#!/usr/bin/env bash
# SessionStart Hook — Load knowledge base and recent daily logs into context
# This script runs automatically at the start of each Claude Code session.
# Its stdout is injected into the conversation context.

set -euo pipefail

RUNTIME_DIR=".bugzy/runtime"

# Clean up any stale hook markers from previous sessions
rm -rf "$RUNTIME_DIR/hooks/.markers" 2>/dev/null || true

PROJECT_CONTEXT="$RUNTIME_DIR/project-context.md"
KB_FILE="$RUNTIME_DIR/knowledge-base.md"
LOGS_DIR="$RUNTIME_DIR/logs"

# --- Memory System Overview ---
cat <<'OVERVIEW'
=== Memory System ===

This project uses a hooks-based memory system with three layers:

1. **Knowledge Base** (`.bugzy/runtime/knowledge-base.md`) — Curated, long-term knowledge. The source of truth.
2. **Daily Log** (`.bugzy/runtime/logs/YYYY-MM-DD.md`) — Scratch buffer for the current day's insights.
3. **Subagent Memory** (`.bugzy/runtime/memory/{role}.md`) — Role-specific knowledge per subagent.

**Lifecycle:** During work, insights accumulate in context. Before context compaction (PreCompact hook), you flush insights to the daily log. At session end (SessionEnd hook), you consolidate the daily log into the knowledge base. Subagents manage their own memory via SubagentStart/SubagentStop hooks.

Below is the current project context, knowledge base, and recent daily logs.
OVERVIEW
echo ""

# --- Load Project Context ---
if [ -f "$PROJECT_CONTEXT" ]; then
  echo "=== Project Context ==="
  cat "$PROJECT_CONTEXT"
  echo ""
fi

# --- Load Knowledge Base ---
if [ -f "$KB_FILE" ]; then
  echo "=== Knowledge Base ==="
  cat "$KB_FILE"
  echo ""
fi

# --- Load Recent Daily Logs ---
if [ -d "$LOGS_DIR" ]; then
  TODAY=$(date +%Y-%m-%d)
  YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")

  if [ -f "$LOGS_DIR/$TODAY.md" ]; then
    echo "=== Daily Log: $TODAY ==="
    cat "$LOGS_DIR/$TODAY.md"
    echo ""
  fi

  if [ -n "$YESTERDAY" ] && [ -f "$LOGS_DIR/$YESTERDAY.md" ]; then
    echo "=== Daily Log: $YESTERDAY ==="
    cat "$LOGS_DIR/$YESTERDAY.md"
    echo ""
  fi

  # --- Prune logs older than 7 days ---
  find "$LOGS_DIR" -name "*.md" -mtime +7 -delete 2>/dev/null || true
fi

exit 0

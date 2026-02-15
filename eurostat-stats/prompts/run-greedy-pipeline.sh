#!/bin/bash
# Greedy Ideas Pipeline — fully automated, project-agnostic
# Runs 3 prompts in sequence: AI examines project, generates ideas, picks 2, writes implementation plan
# Usage: ./prompts/run-greedy-pipeline.sh

set -e
cd "$(dirname "$0")/.."  # project root (parent of prompts/)

PROMPTS="prompts"

# Find next available run number
RUN=1
while [ -f "$PROMPTS/expand-greedy-ideas-${RUN}.md" ]; do
  RUN=$((RUN + 1))
done

IDEAS_FILE="$PROMPTS/expand-greedy-ideas-${RUN}.md"
BUILD_FILE="$PROMPTS/build-greedy-${RUN}.md"

echo "=== Run #$RUN ==="
echo ""

echo "=== Step 1: Examine project and generate greedy ideas ==="
claude -p "$(cat "$PROMPTS/expand-greedy.md")

First, explore this project's codebase thoroughly — read key files, understand the stack, the domain, existing features, and what's missing. Then generate 10 greedy feature ideas tailored to this specific project and write them to $IDEAS_FILE following the format described above." \
  --allowedTools "Read,Write,Glob,Grep,Bash"

echo ""
echo "=== Step 2: AI picks 2 best ideas ==="
CHOSEN=$(claude -p "Read $IDEAS_FILE.

You must pick exactly 2 ideas to implement. Choose the 2 that:
- Have the highest visible impact for end users
- Are feasible given the project's current tech stack and architecture
- Can realistically be built as min-version in 1-2 days each

Output ONLY the idea numbers in this exact format (nothing else):
idea3, idea7" \
  --allowedTools "Read" \
  --output-format text)

# Clean whitespace and extract idea numbers
CHOSEN=$(echo "$CHOSEN" | tr -d '[:space:]' | grep -oP 'idea[0-9]+(,idea[0-9]+)*')
echo "AI chose: $CHOSEN"

echo ""
echo "=== Step 3: Generate implementation plan ==="
claude -p "$(cat "$PROMPTS/implement-greedy-ideas.md")

The selected ideas are: $CHOSEN
Read the ideas from $IDEAS_FILE, assess each selected idea, then write the implementation file to $BUILD_FILE as described." \
  --allowedTools "Read,Write,Glob,Grep,Bash"

echo ""
echo "=== Pipeline complete (Run #$RUN) ==="
echo "Ideas file:  $IDEAS_FILE"
echo "Selected:    $CHOSEN"
echo "Build plan:  $BUILD_FILE"

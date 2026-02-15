# Greedy Ideas — Implementation Prompt

## Instructions

Read this entire prompt, then produce a **separate markdown file** with detailed, clean, step-by-step implementation instructions for **only the selected ideas** provided to you.

The ideas file and selected idea numbers will be provided alongside this prompt. Read the ideas from the specified ideas file.

**Before writing anything**, examine the project codebase to understand:
- The tech stack (languages, frameworks, libraries, build tools)
- The project structure (key files, directories, entry points)
- Existing features and patterns already in use
- Deployment method and constraints (static hosting, backend, etc.)

If an idea's assessment says **NOT WORTH IT**, explain why in the output file instead of giving implementation steps.

The output file should be self-contained — someone with no prior context should be able to read it and implement each feature end-to-end.

---

## Idea Assessments

Read the ideas from the provided ideas file and write an assessment for each selected idea following this format. Examine the project codebase, determine what already exists, what's needed, and give an honest verdict.

### Example Assessment A (worth it):

**Idea: [Name]**

**What:** [One sentence from the ideas file]

**Assessment: WORTH IT — [Impact] impact, [effort level] effort**
- Effort: Min [X] days, Max [Y] days
- [What already exists in the codebase that this builds on]
- [Key technical approach — how it fits the architecture]
- [Main constraint or dependency to watch out for]
- [Anything that makes this easier or harder than it looks]

### Example Assessment B (not worth it):

**Idea: [Name]**

**What:** [One sentence from the ideas file]

**Assessment: NOT WORTH IT — [reason]**
- [Why it doesn't fit the architecture, or requires a backend, or has a fatal flaw]
- [What you'd need that doesn't exist and can't be reasonably built]
- [Alternative suggestion if applicable]

---

## Output Format

Write clear instructions broken into numbered steps, just describe what to do and where.

For each selected idea:
1. **Overview** — What we're building and why (1-2 sentences)
2. **Steps** — Numbered list of actions
3. **Keep it clean** — How to integrate without creating tech debt
4. **Watch out for** — Gotchas and edge cases to keep in mind

For ideas assessed as NOT WORTH IT, just explain why and skip the steps.

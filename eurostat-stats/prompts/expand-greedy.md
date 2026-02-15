# Greedy Thinking Prompt

## What "Greedy" Means Here

Imagine you're opening a restaurant. The safe move is: get the permits, hire an accountant, design the perfect menu, build a website, set up a reservation system. Six months later you open the doors and hope people come.

The greedy move is: cook one amazing dish, set up a table on the sidewalk, and let the smell pull people in. Fix everything else after you have a line out the door.

**That's the mindset for this project.**

The safe engineering approach says: "build the correct infrastructure first — caching layer, modular architecture, config-driven pages, error handling, accessibility audit." That's important work. But it's backstage work. Nobody walks past a restaurant and says "wow, their kitchen is well-organized, let me eat there."

So we build the thing people can smell from the street. The flashiest, highest-impact features that make someone say "this is cool" — not the features that make another developer say "nice architecture."

---

## The Greedy Rules

1. **Serve the dish, not the kitchen.** Don't spend 3 weeks building infrastructure that enables future features. Build the feature that makes someone share the link TODAY.

2. **Impressive beats bulletproof.** A feature that wows 100 users but has a few edge case bugs beats a polished feature that nobody cares about.

3. **Skip the sensible choice.** "Refactor the data layer" is sensible. "Add the feature that makes someone screenshot it and post it" is greedy. Both are useful. Only one makes someone stop scrolling.

4. **Momentum compounds.** One feature that goes viral creates traffic, backlinks, and users that compound over time. Build the feature most likely to create that first spark.

5. **Don't build for a million users.** We need 100 users first. Build for THEM. Redesign the kitchen after the restaurant is full.

6. **Ship when it's hot.** When you finish something cool, share it immediately. Don't sit on it polishing details nobody asked about. Get it out, get reactions, iterate.

---

## How to Use This Prompt

This is a **thinking framework**, not a feature list. Use it to generate ideas:

1. Read this prompt to get into the greedy mindset
2. **Examine the project codebase** — read the files, understand the stack, the domain, the current features, and what's missing
3. Generate 10 ideas tailored to THIS project, following this format:

For each idea, write:
- **What:** One sentence. What is it.
- **Why it's greedy:** What's the big flashy impact. Why this is the dish people smell from the street, not the kitchen renovation.
- **Max version:** The dream. No constraints. Go big.
- **Min version:** Smallest thing you can ship that still hits hard. The rough first version that already turns heads.

End with a **Build Order** that groups ideas into sprints by impact.

---

## What Greedy Ideas Look Like

Greedy ideas share these traits:
- **Instantly impressive.** Someone sees it for the first time and reacts. No tutorial needed.
- **Shareable.** The output is something people want to send to a friend, post on social media, or paste in a group chat.
- **Opinionated.** It says something. Rankings, comparisons, verdicts. Not neutral "here's some data."
- **Visual.** Maps, colors, animations, cards. Not tables, dropdowns, and config panels.
- **Emotional.** Triggers curiosity, pride, surprise, or outrage. Makes people feel something.

## What's NOT Greedy

- Refactoring internals — important, not exciting
- Adding config-driven systems — helps the developer, invisible to users
- Error handling improvements — good hygiene, zero wow factor
- Linting and code formatting — backstage cleanup
- Accessibility audit — needed eventually, but it doesn't fill the restaurant

These are all correct choices. They're just not greedy choices. Build them AFTER you have momentum.

---

## Prioritization Checklist

When deciding what to build next, ask:

| Question | Greedy Answer |
|----------|--------------|
| Will this make someone share the link? | If no, skip it for now |
| Can I explain it in one sentence? | If no, simplify until I can |
| Does it produce a visible output? | If it's invisible infrastructure, it's not greedy |
| Would this be the thumbnail if the project were a YouTube video? | Build the thumbnail feature |
| Does this create an argument or a reaction? | Arguments spread. Neutral tools don't |

---

## One-Line Direction

**Cook the best dish first. Fix the kitchen later. Get people lining up at the door.**

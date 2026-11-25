# DesignPlayground: game design assessment and plan

Date: 25 November 2026. Method: the 5-component filter (Clarity, Motivation, Response, Satisfaction, Fit), abuse tests and playtest scripts.

Status key: **Done** = in this branch. **Next** = planned, not built.

## 1. Player goal and context

The learner trains the eye for space in type. A run is six drills in one mode. The learner drags type until the space looks right, then locks in. The app hides closeness while the learner works. That rule stays: it is the core of the challenge.

## 2. Assessment of the build before this branch

| Component | Finding | Severity |
|---|---|---|
| Clarity | Lock in gave no result. The learner saw a grade only at the end of the run, as one word per drill. The learner could not see where or why an answer was wrong. | High |
| Motivation | No score. Hub showed "done" counts only. Nothing to beat on a second run. | High |
| Response | Kerning stopped at −20 units of 1/290 em (−69/1000 em). Real kerning tables go to −188/1000 em (Archivo Black, "P."). The learner hit a wall before the true answer. | High |
| Satisfaction | One feedback channel (text, at run end). No visual proof. | High |
| Fit | One typeface. Kerning targets came from a hand-made shape model, not from a real font. | Medium |
| Replayability | Only kerning changed the word per seed. Other modes used fixed text and fixed targets. Only the start changed. | Medium |

Measured font kerning (1/1000 em, Chromium canvas, kerning on minus kerning off):

| Pair | Bricolage | Fraunces | Inter | Playfair | Space Grotesk | Archivo Black |
|---|---|---|---|---|---|---|
| To | −67 | −50 | −78 | −41 | −94 | −68 |
| AV | −82 | −40 | −79 | −74 | −46 | −55 |
| Yo | −67 | −60 | −110 | −81 | −88 | −85 |
| LY | −95 | −44 | −87 | −74 | −114 | −77 |
| P. | −54 | −73 | −34 | −75 | −98 | −188 |
| nn, oo, HH | 0 | 0 | 0 | 0 | 0 | 0 |

The same pair needs different values in different fonts. So a font pool gives real variety, and the font's own table is an expert answer key.

## 3. Abuse and break cases found

| # | Exploit | How it worked | Fix | Status |
|---|---|---|---|---|
| A1 | Start side leaks the answer | Start was 28–50% of the range from the target. In kerning the lower side rarely fit, so most starts were too open. "Always close up" won. | Start distance is now in target widths. Side is random when both fit. Test checks both sides occur. | Done |
| A2 | Slam to the range end | Kerning targets sat near −20, the range floor. Dragging hard left landed close. | Range is −300 to +300. Targets come from real fonts, spread from about −190 to +60. | Done |
| A3 | Lock in without moving | A far start still scored a partial grade band in some cases. | A drill handle the learner never moved scores 0. Note says "not moved". | Done |
| A4 | Farm the retry | — | Retry is practice. It shows a review with "Practice, not scored". The first score stays. | Done |
| A5 | Reroll seeds for easy words | New seed is free. | Score is per run; best run is kept. Next: a daily seed with a shared score so rerolls do not help there. | Next |
| A6 | Scene: lock in at once | Some pairs start right. Locking in at once would collect them. | Only broken pairs score. Lock in with no change scores 0. | Done |
| A7 | Scene: change every pair | A learner may move every pair at random. | Each right pair that the learner moves out of its target costs 10 points. | Done |
| A8 | Memorise fixed targets | Tracking, leading and other modes use fixed text and targets. | Next: procedural text, size and case per seed, with rule-based targets (section 7). | Next |
| A9 | Read the DOM | Targets are in client state. | Not a fix target. This is a training tool, not a contest. Note it if a leaderboard comes. | Accepted |

## 4. System rules (built in this branch)

### 4.1 Loop: try, review, next

1. **Try.** The learner drags. Nothing shows closeness.
2. **Lock in.** Handles lock. The score appears at once.
3. **Review.** Three views: *Yours*, *Overlay* (ideal drawn as an outline over the answer, with a numbered mark under each gap), *Ideal*. Notes list the worst pairs first. Each note gives direction, size of the error, the learner's value, the type designer's value, and the shape reason.
4. **Next** or **Try again** (practice, not scored).
5. After the last drill: run score, per-drill scores, best run.

State machine (drill):

| State | Entry | Exit | Interrupt |
|---|---|---|---|
| Working | New drill, Retry | Lock in | Mode or route change resets the run |
| Locked (review) | Lock in | Next, Try again | Route change |
| Summary | Next on the last drill | New seed, Quiz, Hub, Kern on a real page | — |

Edge cases: a locked handle ignores drag and keys; fine control closes on lock in; retry restores the start values; a route change clears lock and retry.

### 4.2 Scoring

Per handle, with target half-width *h* and error *e* from the target centre:

- |e| ≤ h/3 → 100 ("exact")
- |e| ≤ h → 100 down to 70 ("in the zone")
- |e| ≤ 3h → 70 down to 0
- beyond 3h → 0

Drill score = mean of handle scores. Run score = mean of drill scores. Scene score = mean of the broken pairs, minus 10 per good pair broken, floor 0.

Kerning target: font value ± 20 (1/1000 em).

Numbers policy (all are starting values):

| Value | Starting value | Test | Pass | If it fails |
|---|---|---|---|---|
| Kerning half-width | 20/1000 em | 5 designers with 2+ years of practice play 3 runs | Median run score 70–90 | Above 90: cut to 15. Below 70: raise to 25. |
| Exact band | h/3 (≈ 7/1000 em) | Same group | 20–40% of pairs exact | Change the divisor (2.5 to 4) |
| Zero point | 3h | 5 novices, 3 runs | Novice median ≥ 25 on run 1, rising by run 3 | If run 1 median < 15, change to 4h |
| Break penalty | 10 points | 10 scene plays | Fewer than 20% of plays move more than half the good pairs | Raise to 15 |
| Scene nudge | 2.5–5.5 h from the target, 35% of pairs | 10 scene plays | Broken pairs are visible at Fit zoom to designers 8 in 10 times | Raise the minimum to 3.5 h |

### 4.3 Typefaces and answer key

Six faces: Bricolage Grotesque, Inter, Space Grotesk, Archivo Black, Fraunces, Playfair Display. The seed picks one per drill. The answer is the font's own kerning, read with a canvas (`fontKerning` on minus off). If the font cannot load, a shape model gives the value. The stage foot names the font.

ASSUMPTION: a font's kerning table is a good answer key.
IMPACT: the score rewards matching one designer's taste.
IF WRONG: some pairs with odd table values feel unfair.
VALIDATE: log pairs where 3+ expert players miss in the same direction. Review those pairs by hand. Override them in a small table if needed.

### 4.4 Real-world work area (prototype)

Route `#/kerning/scene`, button "On the page" on the hub and "Kern on a real page" on the summary.

Five jobs, each built from common practice:

| Job | Basis | Font styles |
|---|---|---|
| Concert poster | Swiss International Style posters: large grotesk capitals, a circle, flush-left info block | Grotesk, display |
| Landing page hero | Product landing pages: nav, pill, display heading, sub copy, button, product card | Grotesk |
| Magazine masthead | Masthead over a cover photo; mastheads are kerned once by hand and kept as artwork | Serif, display |
| Book jacket | Literary jacket: serif title, rule, review quote, author in spaced capitals | Serif |
| Café sign | Shop fascia with awning; read from a distance | Display, serif |

The seed picks the job, headline, font, palette and shape positions. The headline fits the artboard by measuring the font. The headline arrives with kerning off (0 on every pair), and 35% of pairs are nudged by hand. At least 2 pairs (or 40%) start broken. The learner fixes broken pairs and leaves good ones. Word spaces are fixed. *Zoom* shows the artwork at 2×, as a designer zooms in to kern.

## 5. Playtest scripts

1. **New player.** Open Kerning with no lesson. Ask: "What do you do?" Pass: the learner drags a letter within 20 s and locks in within 3 min. Then ask: "Why did pair 2 lose points?" Pass: they answer from the note without help.
2. **Stress.** Spam arrow keys, drag past both ends, lock in twice fast, press Retry then Lock in. Pass: no crash, values clamp at −300 and +300, the second lock in does not score.
3. **Skill.** Designers play 3 runs. Pass: run 3 mean ≥ run 1 mean + 10.
4. **Abuse.** Lock in without moves (expect 0). Always close up (expect mean < 40 over 3 runs). Scene: set every pair to 0, which is kerning off (expect a low score, because pairs that need kerning stay broken). Pass: no strategy beats honest play.
5. **Readability.** An observer watches the overlay for 10 s, then points to the worst pair. Pass: 4 of 5 observers point to the right pair.

## 6. Tuning priority if it feels wrong

1. "I did not know why" → Clarity: note wording, mark contrast, overlay stroke width.
2. "It feels laggy" → Response: drag ratio (2000 / font size for a centred word, 1000 for left-aligned).
3. "Too hard" or "too easy" → target half-width, then exact band.
4. "I do not care" → Motivation items in section 7.

## 7. Next steps (not built)

| Priority | Item | Why |
|---|---|---|
| 1 | Procedural drills for Tracking, Leading, Word spacing, Line length, Paragraphs, Margins: text, size, case and measure from the seed; targets from rules (tracking falls as size rises and rises for capitals; leading falls as size rises and rises with measure) | Closes A8. Same replay depth as kerning. |
| 2 | Scenes for the other modes: leading in an article column, tracking on a nav label, margins on a card UI, measure in a blog layout | Real-world transfer for every mode |
| 3 | Daily challenge: one seed per date for all learners, score shown on the hub | Closes A5; gives a reason to return |
| 4 | Difficulty tiers: Easy (h = 30, guides on), Normal (h = 20), Pro (h = 12, no grid, smaller sizes, more pairs) | Skill ceiling for designers |
| 5 | Mastery map: per pair class (diagonal, overhang, round, stem) accuracy over time; drills weighted to weak classes | Targeted practice |
| 6 | Loupe in scenes: a 4× lens that follows the selected pair | Scene work at real size on a phone |
| 7 | Sound on lock in and on exact pairs, off by default | Second feedback channel for exact hits |
| 8 | Expert check of model and font values for the 30 most common pairs | Validates the answer key |

## 8. Layout and grid games (non-type)

Date: 25 November 2026. Scope: graphic design basics with no type skill needed. Each game uses the same loop: try, lock in, review with an overlay and notes, next. Each game needs an answer key that the app can calculate.

### 8.1 Ideas

| Group | Game | Learner action | Answer key | Key quality | Status |
|---|---|---|---|---|---|
| Grid | **Spot the drift** | Find 2–4 blocks that moved off a hidden grid, put them back, leave the rest | The seed grid | Objective | **Done** |
| Grid | Build the grid | Set column count, gutter and margin until the grid fits a layout | The seed grid | Objective | Next |
| Grid | Snap to the grid | Place 4–8 elements on a hidden 12-column grid and baseline | Nearest grid line per edge | Objective | Next |
| Grid | Name the system | Quiz: pick the column count, gutter and margin ratio of a layout | The seed grid | Objective | Next |
| Optics | Optical centre | Centre a shape (a play triangle in a circle) so it looks centred | Area centroid; frames sit a little above centre | Needs expert check | Next |
| Optics | Same size | Scale a circle and a triangle to look the same size as a square | Overshoot values (starting value: circle +3–5% diameter) | Needs expert check | Next |
| Optics | Balance the page | Move one object until an asymmetric layout balances | Sum of area × darkness × distance from a pivot | Objective | Next |
| Proportion | Proportion | Drag a rectangle edge to 1:√2, 1:1.618 or 16:9 | The ratio | Objective | Next |
| Gestalt | Group it | Set spaces in a card so label–value pairs read as groups | Space between groups ≥ 2× space inside (starting value) | Rule | Next |
| Gestalt | Spacing scale | Snap each space in a UI to an 8-point scale | Step per role | Rule | Next |
| Gestalt | Size hierarchy | Set 3–5 shape sizes on a modular scale | The scale ratio | Objective | Next |
| Colour | Pass the contrast | Change a brand colour's lightness until it passes WCAG 4.5:1 with the smallest change | WCAG formula plus distance from the brand colour | Objective | Next |
| Colour | Value match | Set a grey to the same value as a colour | OKLCH lightness | Objective | Next |
| Colour | Even steps | Make a 5-step tint ramp with equal visible steps | Equal OKLCH lightness steps | Objective | Next |
| Composition | Crop it | Crop a scene so the focal point sits on a third line | Rule of thumb only | Low | Not planned |

Colour-matching games exist as a genre. These rounds test design tasks (contrast, value, ramps). They do not copy the look of any existing game.

### 8.2 Spot the drift (built)

Route `#/layout/drift`. Hub section "Layout and grid".

**Player goal.** See small breaks in alignment and fix them from the edges that blocks share. This is the core grid skill: a grid shows itself through shared edges, not through drawn lines.

**System rules.**

- The seed picks the job (Magazine page, Dashboard, Landing page, Swiss poster), the column count, the row count, the gutter, the palette and the blocks.
- Rows split into bands. Each band splits into blocks across the columns, from a fixed set of column splits in twelfths. So blocks share column and row lines.
- 2–4 blocks drift by 2.5–5.5 target half-widths, on x, y or both. A block drifts on an axis only when another block that did not drift shares its line on that axis. So the learner always has an edge to align to. A drifted block stays on the page.
- The grid is hidden while the learner works. It shows in the review.
- A drag picks one axis from the first 4 screen px. A tap never moves a block. Alt drags freely. Arrow keys move 1 px, Shift moves 10 px.
- Each block has two handles (x and y offset). The answer for each handle is 0.

**Scoring.** Same curve as kerning (section 4.2). Only drifted axes score. A block the learner did not move scores 0. Each good block that the learner breaks costs 10 points, once per block even if both axes break.

**Review.** Overlay view shows the column bands, the row lines, a dashed outline at the true place of each drifted or broken block, and a numbered mark. Notes give the direction and size in px, and name a block that shares the line ("Line its left edge up with Photo 2.").

**State machine.** Same as the kerning scene: Working → Locked (review) → Next page or Try again (practice, not scored). The job select is off while locked.

**Numbers policy (starting values).**

| Value | Starting value | Test | Pass | If it fails |
|---|---|---|---|---|
| Target half-width | 4 artboard px | 5 designers play 5 pages | Median page score 60–85 | Above 85: cut to 3. Below 60: raise to 6. |
| Drift distance | 2.5–5.5 half-widths (10–22 px) | Same group, Fit zoom on a laptop | Designers find 3 of 4 drifted blocks before lock in | If fewer, raise the minimum to 3.5 half-widths |
| Drifted blocks | 2–4 | 10 pages | Fewer than 20% of pages have a broken good block | If more, the break penalty is too low: raise to 15 |
| Axis lock | 4 screen px | 5 players | Fewer than 1 in 10 drags break the other axis by accident | Raise to 8 px |

**Abuse cases.**

| # | Exploit | Guard |
|---|---|---|
| L1 | Lock in at once | Drifted axes score 0 when not moved |
| L2 | Move every block a little | Break penalty per good block |
| L3 | Snap spam | No snapping, and the grid is hidden until review |
| L4 | Read the DOM | Accepted, as A9 |
| L5 | Small phone: drifts too small to see | Zoom shows 2×. Playtest on a phone; raise the drift minimum on narrow screens if needed |

**Playtest scripts.** New player: finds and fixes 1 block in 60 s without help. Stress: drag a block off the page edge, spam arrows, lock in twice. Skill: designer page 5 score ≥ page 1 + 10. Abuse: lock in at once (expect 0), nudge every block 1 px (expect no penalty, small score), move every block 20 px (expect a low score). Readability: an observer points to the worst block from the overlay in 10 s.

### 8.3 Next for layout games

1. Build the grid: reuses the layout generator; new handles for column count (step), gutter and margin.
2. Optical centre and Same size: short warm-up drills with a strong overlay.
3. Pass the contrast: two-part score (pass gate and distance from brand colour).
4. Engine work: a step handle, a two-part score and a shared SVG artboard.


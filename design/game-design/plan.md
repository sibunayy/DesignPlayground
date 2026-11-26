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


## 9. Context gaps, drag sensitivity and lesson tips

Date: 25 November 2026. Trigger: the learner could not tell how to reach an ideal answer, and fine moves made the word sway.

### 9.1 Assessment (5-component filter)

| Component | Finding | Severity | Fix | Status |
|---|---|---|---|---|
| Response | The kerning word was centred. A changed gap moved every letter by half the change, so the whole word swayed. A 2:1 drag ratio kept the dragged letter under the pointer, but the word still moved. | High | The word keeps its left edge still while the learner works (anchor). The ratio is 1:1. | **Done** |
| Response | One pixel of drag was 5 to 9 units at display sizes (1000 / font size). The centre third of a target is about 7 units wide, so it was 1 to 2 px wide. | High | Speed-based drag gain: slow drag has gain 0.3, fast drag has gain 1. Shift cuts it to 0.25. | **Done** |
| Clarity | The learner saw only one big word. Nothing showed how the word reads at the size where it is used. Designers check at reading size. | High | Small size check: the learner's own answer at 26 px and 14 px under the word. | **Done** |
| Clarity | The learner saw how the score worked only by guessing. The review gave numbers, not a picture of the target. | High | "How this score works" in the review: the rule in words and one scale row for each counted spot. | **Done** |
| Motivation | The lesson was a closed side panel. Most learners never opened it. | Medium | A short tip above every work area. It can be hidden and the choice is saved. | **Done** |
| Clarity | Other modes have no live context beside the stage (for example, a line of body text beside a leading drill). | Medium | Next: a live reference strip for each mode (see 9.4). | Next |

### 9.2 Drag sensitivity

State machine, one handle: *Idle* → *Dragging* on pointer down → *Idle* on pointer up. A locked answer ignores pointer and keys.

Gain: `gain = 0.3 + 0.7 × smoothstep(speed, 0.08, 0.8)`, where speed is a smoothed pointer speed in px per ms. Value change = pointer move × ratio × gain. Shift multiplies by 0.25. The value is rounded to 0.5 only for display, so slow moves do not stall on a rounding step.

| Value | Starting value | Test | Pass | If it fails |
|---|---|---|---|---|
| Slow gain | 0.3 | 5 players set one pair to within the centre third at a 200 px word | Median 4 s or less, median 2 corrections or fewer | Too slow: raise to 0.4. Still jumpy: cut to 0.2. |
| Speed range | 0.08 to 0.8 px per ms | Same group: cross the full range in one move | One drag moves a gap across the range in 1 s | Raise the fast speed to 1.2 |
| Shift gain | 0.25 | Same group, touch pad | Used by fewer than half of the players (the default is good enough) | If most use it, cut slow gain |

Measured in the build: a 20 px slow drag on a 288 px word moved the dragged gap by 21 units and moved no letter to its left. The letters to its right moved by 6 px.

ASSUMPTION: players drag slowly when they want to be exact.
IMPACT: the gain depends on it.
IF WRONG: a slow, deliberate drag feels sluggish, and a fast flick feels too coarse.
VALIDATE: watch 5 players; the fine control and the arrow keys stay as a fallback.

### 9.3 Lesson tips

A strip above every work area, in kerning, the six other modes, the real-page work area and Spot the drift. It has a 112 × 66 vector (shapes only, no fonts, token colours), a title and one or two sentences. A tip teaches a way of looking and never gives a number. A test checks this: no digit in a tip body, a title under 8 words, a body under 27 words. The tip changes with the drill, so a run shows several. The strip hides during the review, so the review has the room.

Playtest: new player, 60 s with the tip open and the tip hidden. Pass: with the tip open, the median first score is at least 5 points higher on runs 1 and 2.

### 9.4 Next

1. A live reference beside each mode's stage: body text next to the leading drill, a card in a page for margins, a paragraph for tracking.
2. A "last time" ghost: the learner's previous answer for the same pair type, to show growth.
3. Tips tied to the learner's weak pair type, after the mastery map (section 7, item 5).

### 9.5 Tracking, and the context of a kerning drill

Trigger: a learner set "Avoid" tighter than the font's plain spacing, thought it looked right, and the overlay showed every pair too tight by 30 to 100 units.

**Diagnosis.** The answer key was checked: the canvas value and the browser's own kerning agree to the unit in all six fonts (Bricolage: Av −54, vo −9, oi 0, id 0). So the key was right and the context was missing. The key is the font's kerning table, and a table only has an opinion about awkward pairs. Pairs such as "oi" and "id" are 0, which means the font's plain spacing. A designer who sets a heavy, display-size word tighter has changed the tracking, not the kerning. The drill scored that as kerning error, so every later letter looked "wildly off" in the overlay, because pair errors add up along the word.

| Component | Finding | Fix | Status |
|---|---|---|---|
| Clarity | The stage did not say what the word is for, which typeface it is in, or what zero means. | A context line on the stage: the use, the typeface and its character, and that tracking is the learner's choice and is not scored. | **Done** |
| Fit | The score treated tracking as kerning error. | The score takes out the learner's own whole-word tracking. | **Done** |
| Clarity | The overlay compared absolute positions, so errors added up along the word. | The outline is drawn at the learner's tracking, so it shows only the pair errors. | **Done** |
| Clarity | The review did not name the tracking. | A first note: "Your tracking: −57. That is tracking, so it is not scored." The notes show the ideal at the learner's tracking. | **Done** |

**Rule.** Tracking = the median distance from the target of the moved gaps, limited to ±80 units. At least 3 gaps must move, or the tracking is 0. Each target moves by the tracking, then the normal curve applies (section 4.2). Real-page jobs (section 4.4) do not use this rule: there the headline arrives with kerning off, and only the broken pairs score.

Check on the reported case: raw score under 25, score with tracking removed 73. The pair that is really wrong (A and v overlap) stays a miss.

| Value | Starting value | Test | Pass | If it fails |
|---|---|---|---|---|
| Tracking limit | ±80 units | 5 designers, 3 runs each | 70% of runs have tracking inside ±80 | Raise to ±120 |
| Median as the estimate | Median of moved gaps | Same runs | Tracking changes by less than 15 units when the worst gap is left out | Use a trimmed mean |

ASSUMPTION: a designer judges pairs against each other and picks tracking for the use.
IMPACT: the score rewards the rhythm of the pairs, not one fixed tightness.
IF WRONG: a learner could set a poor tracking and not be told.
VALIDATE: the review names the tracking. If testers ask for feedback on it, add a tracking drill (the Tracking mode already teaches it).

Abuse cases: "close every gap to the end of the range" gets tracking −80, and the remaining error keeps the score under 20 (tested). "Move only two gaps" gets no tracking forgiveness. "Leave every gap" still scores 0.

Next: a sample line in use (for example the word on a logo plate or in a page header) beside the stage, so the use is seen and not only read.


## 10. Pinned ends, guide lines and a larger word (comparison with KernType)

Date: 26 November 2026. Source: the public page of KernType (type.method.ac) and its public script, read on this date. The facts below come from that script. They are not a claim about the authors' intent.

### 10.1 What KernType does

| Part | KernType |
|---|---|
| Run | 10 words, each in one real typeface, with the type designer and year shown |
| Letters | Real glyph outlines. Each letter is one shape |
| Pinned ends | The first and last letters are fixed. A press on one shows "Letter is fixed" |
| Input | Drag a letter. Tab selects the next letter. Arrow keys move 1 px. Shift moves 10 px |
| Guide lines | Horizontal lines across the screen. The outer lines are drawn heavier (the baseline class) |
| Score | Position error of each letter against the stored answer. 100 when the average error is 1 unit or less. It falls by 5 points for each unit, and 0 at 18 units. The run score is the mean of 10 words |
| Review | A compare view with the answer |
| Layout | The word, a few buttons, a menu behind one icon |

### 10.2 Assessment of our kerning drill (5-component filter)

| Component | Finding | Severity | Fix | Status |
|---|---|---|---|---|
| Clarity | The learner could set the whole word tighter or looser. Tracking was mixed into every answer. Section 9.5 removed the tracking from the score, but the learner still had no fixed frame to judge a gap against. | High | The first and last letters are fixed. The word keeps the length of the answer. | **Done** |
| Clarity | The word floated on a grid of squares. Nothing said where the letters stand. | High | Ascender, x-height and baseline lines run across the stage behind the word. | **Done** |
| Satisfaction | The word was 290 px on a 1366 px screen, with tinted boxes over the gaps and over the selected letter. | Medium | The word fills up to 94% of the stage width and 42% of the screen height. No tint. | **Done** |
| Fit | Prompt, tip, tools, context line, small size check and seed all sat around the word. | Medium | The context line is gone. The font name and the seed share one quiet caption. The tip strip is slimmer. | **Done** |
| Response | A gap handle moved all letters to its right. With fixed ends one gap cannot change alone. | High | A handle is a letter. A letter moves itself and changes the two gaps next to it by the same amount, in opposite directions. | **Done** |
| Fit | The answer key is the font's own kerning table, as in KernType's stored answers. | Low | Kept. | Kept |

### 10.3 System rules

- A drill word has at least 4 letters, so at least 2 letters move. Words of 3 letters left the list.
- **Start.** The learner's start is the answer with a displacement for each inner letter. Each gap changes by the difference of its two letters. So every gap is wrong and the total width does not change. A gap is 3 to 8 target half-widths from its target and stays inside the range.
- **Move.** Letter *k* has position *p* = the sum of the gaps before it. A move by *d* adds *d* to the gap before the letter and takes *d* from the gap after it. *d* is limited so both gaps stay in the range. A drag uses the drag gain from section 9.2. The arrow keys move 1 unit. Shift moves 10. Tab selects the next letter.
- **Fixed letters.** The first and last letters are quieter and show a lock. A press shows "This letter is fixed." They are not sliders.
- **Guide lines.** The ascender is the top of "d". The x-height is the top of "x". The baseline sits at (1 + ascent − descent) / 2 em from the top of a one-em line. The numbers come from the font through a canvas. A fallback is used when the font cannot be measured. The Grid tool in Kerning turns the lines on and off, and it is on by default.
- **Score.** Per gap, as in section 4.2. The score still shows each gap, because the type designer's value is stored for each pair. The tracking offset from section 9.5 is off for these drills: the errors of the gaps add up to zero, so a median would misread a good answer as tracking.
- **Review.** Unchanged: Yours, Overlay and Ideal. The ideal outline now lies exactly on the fixed letters, which shows the learner that only the letters between them are wrong.

State machine (letter): *Idle* → *Selected* (Tab, focus, press) → *Dragging* (pointer down on a movable letter) → *Selected*. A fixed letter has no states and only shows the note. A locked answer ignores pointer and keys.

### 10.4 Numbers (starting values)

| Value | Starting value | Test | Pass | If it fails |
|---|---|---|---|---|
| Nearest start | 3 half-widths (60 units) | 5 players, 5 words | Every gap looks clearly wrong; no player leaves a gap alone | Raise to 3.5 |
| Furthest start | 8 half-widths (160 units) | Same | No letter starts on top of another letter in more than 1 word in 3 | Cut to 6 |
| Word width | 94% of the stage | 5 phones, 5 laptops | No word is cut off at the edge in review | Cut to 88% |
| Word height | 42% of the screen, up to 440 px | 1024 px tall laptop | The word and the lock row fit with no scroll | Cut to 36% |
| Review height | 26% of the screen | Same | The score and two notes show with no scroll | Cut to 22% |
| Guide line strength | 14% (ascender, x-height) and 32% (baseline) | 5 players | 4 of 5 say the lines help and none says they distract | Cut the x-height line to 8% |

ASSUMPTION: players use the end letters as a frame, as they do in KernType.
IMPACT: the fixed ends are the whole reason tracking stops.
IF WRONG: players still judge each gap alone, and scores do not rise from run 1 to run 3.
VALIDATE: the skill script in section 5 (run 3 mean is run 1 mean plus 10).

### 10.5 Abuse cases

| # | Exploit | Guard |
|---|---|---|
| P1 | Close every gap (the A1 exploit) | The total width is fixed. Closing one gap opens another |
| P2 | Set the whole word tighter or looser (tracking) | Not possible: the ends are fixed |
| P3 | Lock in without a move | Every gap starts outside its target, and an unmoved gap scores 0 |
| P4 | Slam a letter to the end of the range | A move is limited so both gaps stay in the range |
| P5 | Read the ideal from the fixed letters | The fixed letters show only the total width, not the value of any one gap |

### 10.6 Playtest scripts

1. **New player.** Open Kerning. Ask "What do you do?". Pass: the player drags a letter within 15 s, and says that the first and last letters do not move.
2. **Stress.** Drag a letter to both ends, press arrow keys and Shift, press a fixed letter, lock in twice. Pass: no crash; a fixed letter never moves; the sum of the gaps does not change.
3. **Skill.** Designers play 3 runs. Pass: run 3 mean is at least run 1 mean plus 10.
4. **Abuse.** Lock in with no move (expect 0). Move every letter by the same amount (expect a low score: only the two end gaps change). Pass: no strategy beats honest play.
5. **Readability.** An observer looks at the overlay for 10 s and names the worst pair. Pass: 4 of 5 name the right one.

### 10.7 Next

1. The type designer and year under the word in the review, as KernType shows. This is a lesson in who made the font.
2. Pinned ends in the real-page work area: the headline keeps its width on the page.
3. A 12-word "marathon" run with a shared score, after the daily seed (section 7, item 3).

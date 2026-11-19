# Design Playground

A web app that teaches graphic design by hand. The learner moves the space and checks the result. The first mode is Kerning. Tracking and Leading follow. The app targets Safari on iPad and iOS, in landscape and portrait.

## Content fundamentals

- Write short sentences in the active voice. One idea per sentence.
- Say what to do: "Make the space between T and y look even."
- Give feedback that names the fault: "Too open. The tinted space is too wide."
- Titles are full claims: "Space is a shape", "Blur the word to see gaps". No topic labels.
- Buttons name the action: "Check spacing", "Next pair", "Start over".
- No filler, no praise openers, no idioms. Do not invent stats or testimonials.

## Visual foundations

- **Ground and surfaces.** Dark first. `ground` holds three surfaces: `stage`, `panel` and the dock. Surfaces have no borders and no shadows. Depth comes from fill only.
- **Stage.** A faint grid in `grid`. One cell equals one square of gap, so the grid measures something. Never use it as wallpaper.
- **Accent.** One accent per mode. Kerning uses `mode-kerning`, Tracking `mode-tracking`, Leading `mode-leading`. Components read `accent`; a mode sets it. Use the accent for the primary button, progress, the gap tint and the on state of toggles.
- **Type.** Bricolage Grotesque at 400, 600 and 800. Six interface styles and two stage styles. No text below 16px.
- **Shape.** Radii by size: `radius-2xl` on stage and panel, `radius-md` on buttons, `radius-sm` on icon chips.
- **Motion.** Buttons scale to 0.98 on press. Nothing else animates. The gap block never transitions. Reduced motion removes all motion.
- **Touch.** Every control has a 44px hit area (`tap-target`). Sliders are 44px high.
- **Themes.** Dark and Light. Both pass 4.5:1 for text. Components ship with `color-scheme` set per theme.

## Iconography

Four assist icons: answer zone, guides and ruler, squint blur, grid. 24px viewBox, drawn at 18px, 2px stroke, round caps and joins, `currentColor`. No emoji and no sparkle glyph.

## Modes

| Mode | Teaches | Accent | Layout |
| --- | --- | --- | --- |
| Kerning | Space between two letters | `mode-kerning` | Stage left, lesson panel right (landscape); panel below (portrait) |
| Tracking | Space across a whole word | `mode-tracking` | Lesson panel left, vertical control rail right |
| Leading | Space between lines | `mode-leading` | Light theme first, wide stage, lesson strip below |

## Rules

1. Use tokens, not raw values. Name the token in the code and in the review.
2. One primary button per view.
3. Show the answer only when the learner turns on the answer zone.
4. Keep the lesson visual truthful: equal numbers must look equal in the picture.
5. Check each pair of text and ground in both themes before release.
6. Avoid AI-default patterns: no gradient text, no feature-card rows, no glow, no nested cards.

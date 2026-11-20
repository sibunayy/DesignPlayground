The stage shows the word under test, the gap as a tinted block, and optional guides.

- Surface: `stage` fill, `radius-2xl`, grid lines in `grid`. One grid cell equals one square of gap (`grid-cell`).
- Word: `stage-word` style, `font-kerning: none`.
- Gap block: `accent-tint` fill, height 52% of the font size, no transition. Width follows the slider with no animation.
- Guides: two 2px `accent` edge lines and a width label in squares, drawn only when the Guides toggle is on.
- Answer zone: a 280px track in `tile`, the correct range in `accent-tint-strong`, and a 4px `ink` marker for the current gap.
- Blur: apply `filter: blur(3% of the font size)` to the word only.

The lesson panel teaches one idea per step with a truthful visual, a claim title, a short body and one tip.

- Surface: `panel`, `radius-2xl`, 26px padding. Width 360px on landscape; full width below the stage in portrait.
- Header: "Kerning lesson" and "Step N of 6" in `caption` style.
- Progress: six bars, `accent` when reached, `bar` when not. The bars are decorative; the step text carries the meaning.
- Visual: `tile` fill, `radius-lg`. Show the real rule, never a stock picture. Equal gaps need equal width in the tinted block.
- Title: `title` style, a full claim ("Space is a shape").
- Body: `body` style, `ink-2`, left aligned. Tip: `caption` style, `muted`.
- Controls: Previous is disabled on step 1. Next reads "Review again" on the last step.

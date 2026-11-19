# Design Playground: design import

Design Playground teaches kerning, tracking and leading by hand. This folder holds the design source for the app. It is not part of the Sightline build (`tsconfig.app.json` includes `src` only).

Imported on 2026-11-19 from three claude.ai artifacts. The artifacts stay the source of truth. Re-import when they change.

| Folder or file | Source | Version |
| --- | --- | --- |
| `handoff.md` | [Design Playground: dev handoff outline](https://claude.ai/artifact/51RJ5mrXCNqPDUse9oZHMk) (Claude Docs) | rev 11 |
| `boards/` | [Design Playground](https://claude.ai/artifact/8zK8iTj9C63KXBrwFcSZSg) (Design canvas) | 1795125087-cc6b |
| `design-system/` | [Design Playground Design System](https://claude.ai/artifact/PunVLUrX48sVJCXs2pGSai) | 1795124949-130f |

## Contents

- `handoff.md`: overview, constraints, screens, interaction spec, data model, build plan and QA checklist.
- `boards/canvas.json`: the canvas index (board names, sizes and order).
- `boards/Main.dc.html`: Kerning, iPad landscape (1180 x 820).
- `boards/Portrait.dc.html`: Kerning, iPad portrait (820 x 1180).
- `boards/Tracking.dc.html`: Tracking mode, amber accent (1180 x 820).
- `boards/Leading.dc.html`: Leading mode, light theme and green accent (1180 x 820).
- `design-system/tokens.json`: colour (Dark and Light), type, spacing and radius tokens.
- `design-system/README.md`: content rules, visual foundations, icons and modes.
- `design-system/components/`: Button, IconToggle, GapStage, LessonPanel and Cover specs with HTML previews.

## Notes on the board files

- The `.dc.html` boards use the claude.ai Design Component format. They load `./support.js` from the canvas runtime, so they do not render when opened directly from this folder. Open the canvas link to see them run.
- Each board's `<script type="text/x-dc">` block holds the exercise data, pass ranges and lesson copy. The handoff says to move this content to typed data files word for word.
- The component previews read CSS custom properties (for example `var(--accent)`). Generate these from `tokens.json` before you render the previews outside the design system page.

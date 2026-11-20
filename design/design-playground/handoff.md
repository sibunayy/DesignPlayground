# Design Playground: dev handoff outline

2026-11-20 · Nathan Walker

> Imported from the Claude Docs document [Design Playground: dev handoff outline](https://claude.ai/artifact/51RJ5mrXCNqPDUse9oZHMk) (revision 11) on 2026-11-19. The live document stays the source; update this copy when the document changes.

## Overview

Design Playground teaches graphic design by hand: the learner moves the space and checks the result. Build the Kerning mode first, then Tracking and Leading.

- **Audience:** designers and design students who learn by doing.
- **Goal:** a touch-first web app that runs well in Safari on iPad and iOS.
- **Source of truth:** the [Design Playground design boards](https://claude.ai/artifact/8zK8iTj9C63KXBrwFcSZSg) and the [design system](https://claude.ai/artifact/PunVLUrX48sVJCXs2pGSai).
- **Non-goals for v1:** accounts, a backend, other modes, or Android and desktop tuning.

## Platform and constraints

Target Safari on iPad first, then Safari on iPhone. The design covers iPad landscape (1180 x 820) and iPad portrait (820 x 1180).

- **Input:** touch and Apple Pencil. Every control has a 44px hit area. Sliders are 44px high.
- **Orientation:** landscape and portrait, with the lesson panel moving from the right side to below the stage.
- **Text:** nothing below 16px. Keep body copy at 17px or more.
- **Safari checks:** use `dvh` units for full-height layouts, test the range input with a finger, and block double-tap zoom on controls.
- **Motion:** only the button press scale. Respect `prefers-reduced-motion`.
- **Open:** iPhone layouts are not designed yet. Confirm the iPhone scope before milestone 5.

## Screens and layouts

Four boards exist. Each is one screen with its own layout. Build them from one shared set of components.

| Board | Size | Mode | Theme and accent | Layout |
| --- | --- | --- | --- | --- |
| Kerning, landscape | 1180 x 820 | Kerning | Dark, blue | Stage left, lesson panel right (360px), dock under the stage |
| Kerning, iPad portrait | 820 x 1180 | Kerning | Dark, blue | Stage on top, dock, lesson panel below with visual left and text right |
| Tracking mode | 1180 x 820 | Tracking | Dark, amber | Lesson panel left (340px), stage and dock right |
| Leading mode | 1180 x 820 | Leading | Light, green | Wide stage, then a dock card and a lesson card side by side |

Every screen has a light and dark switch. There is no mode switcher yet; add one in the header in milestone 4.

## Design system

Implement the tokens first and read them from one source. The [design system](https://claude.ai/artifact/PunVLUrX48sVJCXs2pGSai) holds `tokens.json` with Dark and Light themes. Export it to CSS custom properties; components then read `var(--accent)` and the mode sets it.

- **Colour:** 18 tokens per theme, such as `ground`, `stage`, `panel`, `ink`, `muted` and `accent`. Mode accents are `mode-kerning`, `mode-tracking` and `mode-leading`.
- **Type:** Bricolage Grotesque, weights 400, 600 and 800. Six interface styles and two stage styles.
- **Spacing and radius:** a 6px to 40px spacing scale, a 44px `tap-target` and six radii from 3px to 32px.
- **Gap unit:** one grid cell is 40px and equals one square of gap. It scales by 0.8 when the panel is open on landscape.

Build these components first, each with the states shown in its preview:

1. Button (primary, secondary, disabled)
2. Icon toggle (off, on; four icons plus Compare)
3. Gap stage (word, gap block, guides, answer zone, blur)
4. Lesson panel (step header, progress bars, visual tile, text, Previous and Next)

**Open:** the Kerning boards still hold some hard-coded hex values. Replace them with tokens during build. The inactive progress bar (`bar`) is decorative and below 3:1 contrast.

## Interaction spec

Each mode runs one loop: set the slider, check, read the feedback, move to the next exercise.

1. The slider changes the value live. Changing it clears the feedback message.
2. **Check** compares the value with the exercise range (low and high). The result is `tight`, `loose` or `good`.
3. On `good`, the primary button becomes **Next pair** (Kerning) or **Next exercise** (Tracking, Leading). On the last exercise it reads **Start over** and returns to exercise 1.
4. Feedback shows in an `aria-live="polite"` line under the stage.

| Feature | Kerning | Tracking | Leading |
| --- | --- | --- | --- |
| Slider | 0 to 140 units, step 2 (40 units = 1 square) | -100 to 240 units, step 5 | 80% to 220%, step 5 |
| Exercises | 4 pairs: T\|ype, H\|ome, A\|void, L\|ight | 3: headline, capital label, lowercase text | 3: paragraph, headline, small text |
| Answer zone | Track with range and marker | Track with range and marker | Track with range and marker |
| Guides | Gap edge lines and width label | Not used | Line box guides |
| Squint blur | Yes | Yes | Yes |
| Compare | Not used | Ghost word at 0 tracking | Not used |
| Grid | Yes, on by default | Yes, on by default | Yes, on by default |

- **Assist toggles** are `aria-pressed` buttons. Defaults: grid on, the rest off.
- **Lesson panel:** six steps per mode. Previous is disabled on step 1. Next reads **Review again** on step 6 and returns to step 1.
- **Resources button** (Kerning and Tracking) hides and shows the lesson panel and rescales the stage.
- **Pass ranges:** the ranges in the table are prototype values. Confirm them with a typographer before release.

## Data model and content

Keep all content in typed data files, not in components. v1 has no backend, so progress lives in `localStorage` per browser.

| Entity | Fields |
| --- | --- |
| Mode | `id`, `name`, `accentToken`, `defaultTheme`, `layout`, `unit`, `slider {min, max, step}` |
| Exercise | `id`, `modeId`, `text`, `size`, `lo`, `hi`, `start`, `kind`, `prompt` |
| Lesson step | `id`, `modeId`, `order`, `title`, `body`, `tip`, `visual` |
| Progress | `modeId`, `exerciseIndex`, `completed[]`, `lessonStep`, `theme`, `assists {answer, guides, blur, grid, compare}` |

- **Lesson visuals** are small data objects (rows or columns of sample text with a letter-spacing or line-height value), not images. Equal numbers must look equal.
- **Copy** for all three modes is in the design boards. Move it to data files word for word, then review it with the owner.
- **Safari storage:** wrap every `localStorage` read and write in `try/catch`. Private browsing can throw.

## Proposed architecture and setup

Build a static single-page app with a component framework, a token stylesheet and typed content files. This is a proposal; the dev team decides the stack.

- **Stack:** TypeScript, Vite, and one component framework (React or Preact). Plain CSS with custom properties from the tokens. No backend.
- **State:** one store per mode (value, result, exercise, step, assists). Persist progress to `localStorage`.
- **Hosting:** any static host. Serve over HTTPS and add a web manifest so the app can be added to the iPad home screen.
- **Fonts:** self-host Bricolage Grotesque (400, 600, 800) instead of Google Fonts, and preload the 800 weight.
- **Testing:** unit tests for check logic and data, plus a Safari device test pass per milestone.

```
src/
  tokens/        tokens.json, tokens.css (generated)
  components/    Button, IconToggle, GapStage, LessonPanel, Dock
  modes/         kerning/, tracking/, leading/  (logic + layout)
  content/       modes.ts, exercises.ts, lessons.ts
  state/         store.ts, storage.ts
  app.tsx        header, mode routing, theme
```

## Build plan

Build in this order. Each milestone ships to a device before the next starts.

1. **Foundations.** Project setup, token CSS, themes, self-hosted font, base components. Done when the four component previews match in both themes.
2. **Kerning, landscape.** Stage, slider, Check, Next pair, four pairs, lesson panel with six steps. Done when a learner finishes all four pairs on an iPad.
3. **Assists.** Answer zone, guides, squint blur and grid toggles with `aria-pressed`. Done when each toggle works with touch and the keyboard.
4. **Mode shell.** Header with a mode switcher, theme switch, progress in `localStorage`. Add Tracking and Leading on the shared logic. Done when all three modes run from one app.
5. **Portrait and iPhone.** Kerning portrait layout, then the portrait layouts for the other modes. Confirm iPhone scope first.
6. **Polish and release.** Accessibility pass, Safari device pass, performance check, add-to-home-screen support. Done when the QA checklist below passes.

## Accessibility, QA and open questions

Check these before release:

- [ ] Text contrast is 4.5:1 or more in Dark and Light, in all three modes.
- [ ] Every control has a 44px hit area and a visible focus ring (3px `ink`).
- [ ] The slider works by touch, Pencil and keyboard arrow keys, and has a visible label.
- [ ] Feedback text is announced through the `aria-live` line.
- [ ] Toggles expose `aria-pressed`; icon buttons have an `aria-label`.
- [ ] The stage word has an `aria-label`; lesson visuals are `aria-hidden`.
- [ ] Reduced motion removes the press animation.
- [ ] Landscape and portrait both work on iPad, with no horizontal scroll.
- [ ] The word fits the stage at the widest slider value, with the panel open and closed.
- [ ] Progress survives a reload and does not break in private browsing.

Open questions:

- [ ] Who confirms the pass ranges and the lesson copy?
- [ ] Is iPhone in scope for v1?
- [ ] Which stack and host does the dev team want?
- [ ] Do the Kerning boards switch to tokens before build, or does the dev team do it?

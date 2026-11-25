import { Mode, ModeId } from '../types';

/**
 * Mode definitions. Kerning, Tracking and Leading come from the Design Playground
 * design boards. Word spacing, Line length and Paragraphs extend the same loop.
 * Pass ranges are prototype values: confirm them with a typographer before release.
 */
export const MODES: Mode[] = [
  {
    id: 'kerning',
    name: 'Kerning',
    teaches: 'Space between letters',
    accentToken: 'mode-kerning',
    defaultTheme: 'dark',
    layout: 'panel-right',
    slider: { min: -300, max: 300, step: 1 },
    assists: ['guides', 'blur', 'grid'],
    quizQuestion: 'Which pair has the better kerning?',
    lessonName: 'Kerning lesson',
    feedback: {
      loose: 'Too open. The tinted space is too wide.',
      tight: 'Too tight. The letters nearly touch.',
      good: 'Balanced. The space looks even.',
      goodLast: 'Balanced. Every pair in this mode is done.',
    },
  },
  {
    id: 'tracking',
    name: 'Tracking',
    teaches: 'Space across a whole word',
    accentToken: 'mode-tracking',
    defaultTheme: 'dark',
    layout: 'panel-left',
    slider: { min: -200, max: 400, step: 5 },
    assists: ['compare', 'blur', 'grid'],
    quizQuestion: 'Which word has the better tracking?',
    lessonName: 'Tracking lesson',
    feedback: {
      loose: 'Too open. The letters drift apart.',
      tight: 'Too tight. The letters crowd each other.',
      good: 'Balanced. The letters look evenly open.',
      goodLast: 'Balanced. Every exercise in this mode is done.',
    },
  },
  {
    id: 'leading',
    name: 'Leading',
    teaches: 'Space between lines',
    accentToken: 'mode-leading',
    defaultTheme: 'light',
    layout: 'panel-below',
    slider: { min: 70, max: 250, step: 5 },
    assists: ['guides', 'blur', 'grid'],
    quizQuestion: 'Which text has the better leading?',
    lessonName: 'Leading lesson',
    feedback: {
      loose: 'Too open. The lines drift apart.',
      tight: 'Too tight. The lines crowd each other.',
      good: 'Balanced. The lines look evenly spaced.',
      goodLast: 'Balanced. Every exercise in this mode is done.',
    },
  },
  {
    id: 'wordspace',
    name: 'Word spacing',
    teaches: 'Space between words',
    accentToken: 'mode-wordspace',
    defaultTheme: 'dark',
    layout: 'panel-right',
    slider: { min: -200, max: 700, step: 10 },
    assists: ['compare', 'blur', 'grid'],
    quizQuestion: 'Which line has the better word spacing?',
    lessonName: 'Word spacing lesson',
    feedback: {
      loose: 'Too open. The line breaks into single words.',
      tight: 'Too tight. The words run together.',
      good: 'Balanced. The words read as one line.',
      goodLast: 'Balanced. Every exercise in this mode is done.',
    },
  },
  {
    id: 'measure',
    name: 'Line length',
    teaches: 'Characters per line',
    accentToken: 'mode-measure',
    defaultTheme: 'light',
    layout: 'panel-below',
    slider: { min: 10, max: 120, step: 1 },
    assists: ['guides', 'grid'],
    quizQuestion: 'Which text has the better line length?',
    lessonName: 'Line length lesson',
    feedback: {
      loose: 'Too long. The eye loses its place at the line end.',
      tight: 'Too short. The eye jumps to a new line too often.',
      good: 'Balanced. The lines are a comfortable length.',
      goodLast: 'Balanced. Every exercise in this mode is done.',
    },
  },
  {
    id: 'paragraph',
    name: 'Paragraphs',
    teaches: 'Space between paragraphs',
    accentToken: 'mode-paragraph',
    defaultTheme: 'light',
    layout: 'panel-right',
    slider: { min: 0, max: 300, step: 10 },
    assists: ['guides', 'blur', 'grid'],
    quizQuestion: 'Which text has the better paragraph space?',
    lessonName: 'Paragraphs lesson',
    feedback: {
      loose: 'Too open. The paragraphs look like separate blocks.',
      tight: 'Too tight. The reader cannot see where a paragraph starts.',
      good: 'Balanced. Each new paragraph is clear and the text holds together.',
      goodLast: 'Balanced. Every exercise in this mode is done.',
    },
  },
  {
    id: 'margins',
    name: 'Margins',
    teaches: 'Space around a text block',
    accentToken: 'mode-margins',
    defaultTheme: 'dark',
    layout: 'panel-right',
    slider: { min: 0, max: 400, step: 10 },
    assists: ['guides', 'blur', 'grid'],
    quizQuestion: 'Which box has the better margins?',
    lessonName: 'Margins lesson',
    feedback: {
      loose: 'Too open. The text floats and the box looks empty.',
      tight: 'Too tight. The text crowds the edge of the box.',
      good: 'Balanced. The text sits in the box with clear space on each side.',
      goodLast: 'Balanced. Every exercise in this mode is done.',
    },
  },
];

/** Daily pick: one mode per date, the same for every learner on that date. */
export function dailyPickMode(dateStr: string): ModeId {
  let h = 0;
  for (const ch of dateStr) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MODES[h % MODES.length].id;
}

export const MODE_IDS: ModeId[] = MODES.map((m) => m.id);

export function getMode(id: string): Mode | undefined {
  return MODES.find((m) => m.id === id);
}

export function isModeId(id: string): id is ModeId {
  return MODE_IDS.includes(id as ModeId);
}

import { LessonStep, LessonVisual, ModeId } from '../types';

type StepInput = { title: string; body: string; tip: string; visual: LessonVisual };

function steps(modeId: ModeId, list: StepInput[]): LessonStep[] {
  return list.map((s, i) => ({ id: `${modeId}-${i + 1}`, modeId, order: i + 1, ...s }));
}

/**
 * Lesson steps, six per mode. Kerning, Tracking and Leading copy comes word for word
 * from the design boards. Lesson visuals are data, so equal numbers draw equal space.
 */
export const LESSONS: LessonStep[] = [
  ...steps('kerning', [
    {
      title: 'Kerning sets one pair',
      body: 'Move two letters closer or further apart until the space around them looks even.',
      tip: 'Pairs like A and V leave an open wedge, so they usually need less space.',
      visual: { kind: 'kernPairs', size: 120, items: [{ left: 'A', right: 'V', gapEm: 0.28 }] },
    },
    {
      title: 'Tracking sets the whole word',
      body: 'Tracking changes the space between all letters in a word or line at once. Kerning then fixes single pairs.',
      tip: 'Set tracking first, then kern.',
      visual: {
        kind: 'textRows',
        size: 52,
        rows: [
          { text: 'AV', tracking: -60, label: 'One pair' },
          { text: 'SPACE', tracking: 180, label: 'Whole word' },
        ],
      },
    },
    {
      title: 'Space is a shape',
      body: 'Two gaps with the same distance can look different. Straight sides leave a tall, square gap. Diagonals leave a wedge.',
      tip: 'Give straight sides more space and diagonals less.',
      visual: {
        kind: 'kernPairs',
        size: 76,
        items: [
          { left: 'H', right: 'H', gapEm: 0.26 },
          { left: 'A', right: 'V', gapEm: 0.26 },
        ],
        caption: 'Same distance, different look',
      },
    },
    {
      title: 'Blur the word to see gaps',
      body: 'Squint or blur the word. Even spacing reads as an even grey. A light or dark patch marks a gap to fix.',
      tip: 'Try it on the word in the stage.',
      visual: { kind: 'blurWord', text: 'Type', size: 96 },
    },
    {
      title: 'Diagonals and overhangs need less',
      body: 'Pairs with a diagonal or an overhang open a large gap. Check these pairs first when you set a word.',
      tip: 'Also check Yo, Ta and a P next to a comma.',
      visual: { kind: 'pairList', size: 48, items: ['AV', 'To', 'Ty', 'LT'] },
    },
    {
      title: 'Tight, loose or uneven',
      body: 'Tight: letters touch or merge. Loose: the word breaks into single letters. Uneven: one gap looks different from the rest.',
      tip: 'Aim for even, then run the squint test.',
      visual: {
        kind: 'textRows',
        size: 44,
        rows: [
          { text: 'Type', tracking: -120, label: 'Tight' },
          { text: 'Type', tracking: 20, label: 'Even' },
          { text: 'Type', tracking: 300, label: 'Loose' },
        ],
      },
    },
  ]),

  ...steps('tracking', [
    {
      title: 'Tracking moves every letter at once',
      body: 'Tracking adds or removes the same space between all letters. Kerning then fixes single pairs.',
      tip: 'Set tracking first, then kern. One unit is 1/1000 of the font size.',
      visual: {
        kind: 'textRows',
        size: 40,
        rows: [
          { text: 'Type', tracking: -60, label: 'Tight' },
          { text: 'Type', tracking: 0, label: 'Default' },
          { text: 'Type', tracking: 150, label: 'Open' },
        ],
      },
    },
    {
      title: 'Large type needs less tracking',
      body: 'Big letters create big gaps. Tighten a headline a little so it reads as one shape.',
      tip: 'Try -10 to -40 units on large headlines.',
      visual: {
        kind: 'textRows',
        size: 52,
        rows: [
          { text: 'Poster', tracking: 0, label: 'Default' },
          { text: 'Poster', tracking: -30, label: 'Tightened' },
        ],
      },
    },
    {
      title: 'Capital letters need more tracking',
      body: 'Capitals have no ascenders or descenders. Open the space so each letter can breathe.',
      tip: 'Try 50 to 150 units on capital labels.',
      visual: {
        kind: 'textRows',
        size: 40,
        rows: [
          { text: 'LABEL', tracking: 0, label: 'Default' },
          { text: 'LABEL', tracking: 100, label: 'Opened' },
        ],
      },
    },
    {
      title: 'Small text needs a little more space',
      body: 'At small sizes, letters blur together. A small increase keeps them clear.',
      tip: 'Try 5 to 25 units on small text.',
      visual: {
        kind: 'textRows',
        size: 26,
        rows: [
          { text: 'Small text', tracking: 0, label: 'Default' },
          { text: 'Small text', tracking: 20, label: 'Opened' },
        ],
      },
    },
    {
      title: 'Even tracking gives an even grey',
      body: 'Blur the line. Tight tracking makes dark patches. Loose tracking makes light patches.',
      tip: 'Use the squint toggle on the stage.',
      visual: {
        kind: 'textRows',
        size: 34,
        blur: true,
        rows: [
          { text: 'Reading', tracking: -50, label: 'Tight' },
          { text: 'Reading', tracking: 10, label: 'Even' },
          { text: 'Reading', tracking: 160, label: 'Loose' },
        ],
      },
    },
    {
      title: 'Do not track lowercase text hard',
      body: 'Wide tracking breaks word shapes in lowercase text. Keep body text near zero.',
      tip: 'Use wide tracking on capitals only.',
      visual: {
        kind: 'textRows',
        size: 28,
        rows: [
          { text: 'lowercase words', tracking: 0, label: 'Word shapes hold' },
          { text: 'lowercase words', tracking: 200, label: 'Word shapes break' },
        ],
      },
    },
  ]),

  ...steps('leading', [
    {
      title: 'Leading is the space between lines',
      body: 'Leading sets the distance from one baseline to the next. Most text looks best near 120% to 145%.',
      tip: 'Set the size first, then the leading.',
      visual: {
        kind: 'lineCols',
        size: 18,
        cols: [
          { lineHeight: 0.9, label: 'Tight' },
          { lineHeight: 1.4, label: 'Even' },
          { lineHeight: 2.0, label: 'Open' },
        ],
      },
    },
    {
      title: 'Longer lines need more leading',
      body: 'A long line makes the eye travel far. Extra space helps it find the next line.',
      tip: 'Add leading as the line grows.',
      visual: {
        kind: 'lineCols',
        size: 20,
        cols: [
          { lineHeight: 1.2, label: 'Short, 120%' },
          { lineHeight: 1.6, label: 'Long, 160%' },
        ],
      },
    },
    {
      title: 'Large type needs less leading',
      body: 'Big headlines look loose at 140%. Pull the lines closer, near 100%.',
      tip: 'Try 95% to 110% on headlines.',
      visual: {
        kind: 'lineCols',
        size: 28,
        cols: [
          { lineHeight: 1.4, label: 'Loose' },
          { lineHeight: 1.0, label: 'Tight' },
        ],
      },
    },
    {
      title: 'Small type needs more leading',
      body: 'At small sizes, lines blur together. Open them to 150% or more.',
      tip: 'Try 150% to 175% on small text.',
      visual: {
        kind: 'lineCols',
        size: 15,
        cols: [
          { lineHeight: 1.2, label: 'Crowded' },
          { lineHeight: 1.6, label: 'Clear' },
        ],
      },
    },
    {
      title: 'Even leading gives an even grey',
      body: 'Blur the paragraph. Tight leading makes dark bands. Loose leading makes light bands.',
      tip: 'Use the squint toggle in the header.',
      visual: {
        kind: 'lineCols',
        size: 18,
        blur: true,
        cols: [
          { lineHeight: 1.0, label: 'Tight' },
          { lineHeight: 1.5, label: 'Even' },
          { lineHeight: 2.1, label: 'Loose' },
        ],
      },
    },
    {
      title: 'Leading scales with size',
      body: 'Double the size and the leading in pixels doubles too. Keep the percent, then adjust by eye.',
      tip: 'Set leading as a percent of the size.',
      visual: {
        kind: 'lineCols',
        size: 14,
        cols: [
          { lineHeight: 1.4, label: '14 px, 20 px', size: 14 },
          { lineHeight: 1.4, label: '22 px, 31 px', size: 22 },
        ],
      },
    },
  ]),

  ...steps('wordspace', [
    {
      title: 'Word space separates words',
      body: 'The space between words tells the eye where one word ends. It must be wider than the space between letters.',
      tip: 'One unit is 1/1000 of the font size, added to the normal space.',
      visual: {
        kind: 'textRows',
        size: 30,
        rows: [
          { text: 'read this', wordSpacing: -200, label: 'Too tight' },
          { text: 'read this', wordSpacing: 0, label: 'Normal' },
          { text: 'read this', wordSpacing: 400, label: 'Too open' },
        ],
      },
    },
    {
      title: 'Open spaces break the line',
      body: 'Wide word spaces cut a line into single words. The reader then reads word by word, not phrase by phrase.',
      tip: 'Keep body text near the normal word space.',
      visual: {
        kind: 'textRows',
        size: 24,
        rows: [
          { text: 'one clear line', wordSpacing: 0, label: 'Holds' },
          { text: 'one clear line', wordSpacing: 500, label: 'Breaks' },
        ],
      },
    },
    {
      title: 'Track the letters, then the words',
      body: 'When you open the tracking on capitals, the word space looks smaller. Open the word space by the same feel.',
      tip: 'Try 80 to 180 units on tracked capital labels.',
      visual: {
        kind: 'textRows',
        size: 22,
        rows: [
          { text: 'OPEN DAILY', tracking: 120, wordSpacing: 0, label: 'Words merge' },
          { text: 'OPEN DAILY', tracking: 120, wordSpacing: 150, label: 'Words clear' },
        ],
      },
    },
    {
      title: 'Headlines need closer words',
      body: 'Large type makes the word space large too. Close it a little so the headline reads as one shape.',
      tip: 'Try -10 to -80 units on large headlines.',
      visual: {
        kind: 'textRows',
        size: 36,
        rows: [
          { text: 'Big news', wordSpacing: 0, label: 'Default' },
          { text: 'Big news', wordSpacing: -60, label: 'Closed' },
        ],
      },
    },
    {
      title: 'Even word space gives an even grey',
      body: 'Blur the line. Wide word spaces show as pale gaps. Tight word spaces make dark patches.',
      tip: 'Use the squint toggle on the stage.',
      visual: {
        kind: 'textRows',
        size: 26,
        blur: true,
        rows: [
          { text: 'words in a row', wordSpacing: -200, label: 'Tight' },
          { text: 'words in a row', wordSpacing: 0, label: 'Even' },
          { text: 'words in a row', wordSpacing: 450, label: 'Loose' },
        ],
      },
    },
    {
      title: 'Compare with the normal space',
      body: 'Turn on Compare to see the line with the normal word space behind your line. Check the difference by eye.',
      tip: 'Change the space in small steps, then step back and look.',
      visual: {
        kind: 'textRows',
        size: 30,
        rows: [
          { text: 'a calm line', wordSpacing: 0, label: 'Normal' },
          { text: 'a calm line', wordSpacing: 120, label: 'Opened' },
        ],
      },
    },
  ]),

  ...steps('measure', [
    {
      title: 'Line length is a count of characters',
      body: 'Measure line length in characters, not in pixels. The count stays true at every font size.',
      tip: 'Count letters, spaces and punctuation.',
      visual: {
        kind: 'measureLines',
        size: 10,
        rows: [
          { ch: 20, label: '20' },
          { ch: 30, label: '30' },
          { ch: 40, label: '40' },
        ],
      },
    },
    {
      title: 'Books use 55 to 75 characters',
      body: 'Long reading is most comfortable near 66 characters per line. The eye returns to the next line without effort.',
      tip: 'Start at 66 and adjust by eye.',
      visual: {
        kind: 'measureLines',
        size: 4.5,
        rows: [
          { ch: 45, label: 'Short' },
          { ch: 66, label: 'Ideal' },
          { ch: 90, label: 'Long' },
        ],
      },
    },
    {
      title: 'Long lines lose the reader',
      body: 'On a very long line, the eye can return to the wrong line. The reader reads the same line twice.',
      tip: 'Above 80 characters, add leading or narrow the column.',
      visual: { kind: 'measureLines', size: 4.5, rows: [{ ch: 95, label: '95' }] },
    },
    {
      title: 'Short lines break the rhythm',
      body: 'Very short lines make the eye jump too often. Words split and the right edge turns ragged.',
      tip: 'Below 35 characters, use a smaller font or a wider column.',
      visual: { kind: 'measureLines', size: 10, rows: [{ ch: 25, label: '25' }] },
    },
    {
      title: 'Columns and phones run shorter',
      body: 'A column of a multi-column page holds 40 to 55 characters. A phone screen holds 30 to 45.',
      tip: 'Short lines need a little less leading.',
      visual: {
        kind: 'measureLines',
        size: 5,
        rows: [
          { ch: 38, label: 'Phone' },
          { ch: 48, label: 'Column' },
          { ch: 66, label: 'Book' },
        ],
      },
    },
    {
      title: 'Length, size and leading work together',
      body: 'Set the size first. Then set the line length. Then set the leading to suit the length.',
      tip: 'A longer line needs more leading.',
      visual: {
        kind: 'lineCols',
        size: 15,
        cols: [
          { lineHeight: 1.3, label: 'Short line' },
          { lineHeight: 1.6, label: 'Long line' },
        ],
      },
    },
  ]),
  ...steps('paragraph', [
    {
      title: 'Paragraph space marks a new idea',
      body: 'Space between paragraphs shows the reader where a new idea starts. It must be larger than the space between lines.',
      tip: 'Measure paragraph space in lines. 100% is one empty line.',
      visual: {
        kind: 'paraCols',
        cols: [
          { gaps: [0, 0], label: 'None' },
          { gaps: [0.75, 0.75], label: 'Clear' },
        ],
      },
    },
    {
      title: 'Too little space hides the break',
      body: 'When the paragraph space is close to the line space, the reader cannot see where a paragraph ends.',
      tip: 'A paragraph that ends on a full line has no visible break at all.',
      visual: {
        kind: 'paraCols',
        cols: [
          { gaps: [0.15, 0.15], label: 'Hidden' },
          { gaps: [0.75, 0.75], label: 'Clear' },
        ],
      },
    },
    {
      title: 'Too much space breaks the text apart',
      body: 'Large gaps turn paragraphs into separate blocks. The reader stops reading them as one text.',
      tip: 'If the gap is taller than two lines, the paragraphs look unrelated.',
      visual: {
        kind: 'paraCols',
        cols: [
          { gaps: [0.75, 0.75], label: 'Clear' },
          { gaps: [2.5, 2.5], label: 'Apart' },
        ],
      },
    },
    {
      title: 'Body text uses half a line to one line',
      body: 'For body text, set the paragraph space between 50% and 100% of the line height.',
      tip: 'Large text needs less than one line, because each line is already tall.',
      visual: {
        kind: 'paraCols',
        cols: [
          { gaps: [0.5, 0.5], label: 'Half' },
          { gaps: [1, 1], label: 'One line' },
        ],
      },
    },
    {
      title: 'Use an indent or space, not both',
      body: 'An indent on the first line also marks a new paragraph. With an indent, set the paragraph space to zero.',
      tip: 'Do not indent the first paragraph after a heading.',
      visual: {
        kind: 'paraCols',
        cols: [
          { gaps: [0, 0], indent: true, label: 'Indent' },
          { gaps: [1, 1], indent: true, label: 'Both' },
        ],
      },
    },
    {
      title: 'Keep the space the same everywhere',
      body: 'Every paragraph break in a text gets the same space. A different gap tells the reader that something else changed.',
      tip: 'Use a larger gap only for a new section.',
      visual: {
        kind: 'paraCols',
        cols: [
          { gaps: [0.75, 0.75], label: 'Even' },
          { gaps: [0.3, 1.6], label: 'Uneven' },
        ],
      },
    },
  ]),
  ...steps('margins', [
    {
      title: 'Margins frame the content',
      body: 'A margin is the space between the content and the edge of its box. It lets the reader see the text and the box as one unit.',
      tip: 'The edge of a box is a line. Text that touches a line is hard to read.',
      visual: {
        kind: 'padBoxes',
        cols: [
          { pad: 0.15, label: 'None' },
          { pad: 1, label: 'Framed' },
        ],
      },
    },
    {
      title: 'Too little space crowds the edge',
      body: 'When the margin is smaller than the line space, the text seems to push against the box.',
      tip: 'Make the margin at least as large as the space between lines.',
      visual: {
        kind: 'padBoxes',
        cols: [
          { pad: 0.3, label: 'Crowded' },
          { pad: 1, label: 'Framed' },
        ],
      },
    },
    {
      title: 'Too much space loses the link',
      body: 'A very large margin makes the box look empty. The text floats and no longer belongs to its box.',
      tip: 'For cards, one to one and a half times the text size is a good start.',
      visual: {
        kind: 'padBoxes',
        cols: [
          { pad: 1, label: 'Framed' },
          { pad: 2.6, label: 'Empty' },
        ],
      },
    },
    {
      title: 'Scale the margin with the text',
      body: 'Set the margin in relation to the text size. Large text needs a larger margin. Small text needs a smaller one.',
      tip: 'Measure margins in em: 1 em is the text size.',
      visual: {
        kind: 'padBoxes',
        cols: [
          { pad: 1, label: '1 em' },
          { pad: 1.5, label: '1.5 em' },
        ],
      },
    },
    {
      title: 'Buttons use less space top and bottom',
      body: 'A button needs more space at the sides than at the top and bottom. Equal space on all sides makes it look swollen.',
      tip: 'Start with 1 em at the sides and 0.5 em at the top and bottom.',
      visual: {
        kind: 'padBoxes',
        cols: [
          { pad: 1, padY: 1, label: 'Swollen' },
          { pad: 1, padY: 0.5, label: 'Firm' },
        ],
      },
    },
    {
      title: 'Inner space is smaller than outer space',
      body: 'The space inside a box must be smaller than the space between two boxes. Then each box reads as one group.',
      tip: 'If the gap between boxes is smaller than the margin, the groups mix.',
      visual: {
        kind: 'padBoxes',
        cols: [
          { pad: 0.5, gap: 1.2, label: 'Grouped' },
          { pad: 1.2, gap: 0.4, label: 'Mixed' },
        ],
      },
    },
  ]),
];

export function lessonsFor(modeId: ModeId): LessonStep[] {
  return LESSONS.filter((l) => l.modeId === modeId).sort((a, b) => a.order - b.order);
}

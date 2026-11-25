import type { ModeId } from '../types';

/**
 * Short lessons shown above the work. Each tip teaches a way of looking, never an answer: no tip
 * gives a number the learner could type in. A title is under 7 words. A body is under 26 words.
 */

export type TipArtKind =
  | 'pair-area'
  | 'diagonal'
  | 'overhang'
  | 'squint'
  | 'zoom-out'
  | 'rhythm'
  | 'tracking-size'
  | 'leading'
  | 'measure'
  | 'word-space'
  | 'paragraph'
  | 'pad-box'
  | 'grid-edges'
  | 'grid-axes'
  | 'keep-good';

export interface Tip {
  id: string;
  title: string;
  body: string;
  art: TipArtKind;
}

export type TipTopic = ModeId | 'scene' | 'drift';

export const TIPS: Record<TipTopic, Tip[]> = {
  kerning: [
    {
      id: 'kern-area',
      title: 'Judge the white, not the gap',
      body: 'Kerning evens out the area of white between letters. A round letter beside a straight one needs a smaller gap than two straight stems.',
      art: 'pair-area',
    },
    {
      id: 'kern-diagonal',
      title: 'Diagonals sit closer',
      body: 'A, V, W and Y leave a triangle of white. Tuck the next letter into the triangle until the space matches its neighbours.',
      art: 'diagonal',
    },
    {
      id: 'kern-overhang',
      title: 'Arms lend their space',
      body: 'T, F and P have an arm above the next letter. The next small letter can slip in under the arm.',
      art: 'overhang',
    },
    {
      id: 'kern-squint',
      title: 'Squint to see the rhythm',
      body: 'Turn on Blur, or squint. Dark clumps and bright holes show up at once. An even grey is the goal.',
      art: 'squint',
    },
    {
      id: 'kern-small',
      title: 'Check it at reading size',
      body: 'A gap that looks right at poster size can look wrong small. Check the small preview under the word before you lock in.',
      art: 'zoom-out',
    },
    {
      id: 'kern-rhythm',
      title: 'Work outward from one gap',
      body: 'Set the gap that looks worst first. Every other gap now looks different, so judge each one again after each change.',
      art: 'rhythm',
    },
  ],
  tracking: [
    {
      id: 'track-size',
      title: 'Large type needs tighter tracking',
      body: 'The space between letters grows with the letters. At a large size the same tracking looks loose.',
      art: 'tracking-size',
    },
    {
      id: 'track-caps',
      title: 'Capitals want air',
      body: 'Capitals have no tall and low letters to fill space. A line of capitals reads better with a little more tracking.',
      art: 'tracking-size',
    },
    {
      id: 'track-squint',
      title: 'Squint for an even grey',
      body: 'Blur the line. If it holds together as an even grey bar, the tracking is close. Gaps and clumps mean it is not.',
      art: 'squint',
    },
  ],
  leading: [
    {
      id: 'lead-measure',
      title: 'Longer lines need more leading',
      body: 'The eye needs a clear path back to the next line. The longer the line, the more space that path needs.',
      art: 'leading',
    },
    {
      id: 'lead-size',
      title: 'Large type needs tighter leading',
      body: 'Leading is a ratio of type size. At a large size the same ratio looks loose, so headlines sit close.',
      art: 'leading',
    },
    {
      id: 'lead-squint',
      title: 'Squint for stripes',
      body: 'Blur the block. Even stripes of text and white mean good leading. Dark bands or touching lines mean too tight.',
      art: 'squint',
    },
  ],
  wordspace: [
    {
      id: 'word-gap',
      title: 'Spaces should not shout',
      body: 'A word space should separate words and stay quiet. Too wide, and white rivers run down the text.',
      art: 'word-space',
    },
    {
      id: 'word-caps',
      title: 'Spaced capitals need wider spaces',
      body: 'Letter-spaced capitals make every gap wider, so word spaces must grow with them or the words run together.',
      art: 'word-space',
    },
  ],
  measure: [
    {
      id: 'measure-eye',
      title: 'Let the eye find the next line',
      body: 'A line that is too long loses the eye on the return. A line that is too short chops phrases in two.',
      art: 'measure',
    },
    {
      id: 'measure-count',
      title: 'Count characters, not inches',
      body: 'Measure is the number of characters on a line, so it changes with type size and the width of the face.',
      art: 'measure',
    },
  ],
  paragraph: [
    {
      id: 'para-one',
      title: 'Use one signal, not two',
      body: 'Mark a new paragraph with an indent or with space between paragraphs. Using both says the same thing twice.',
      art: 'paragraph',
    },
    {
      id: 'para-lines',
      title: 'Count in lines',
      body: 'A gap between paragraphs is easiest to judge in lines. It should be clear but never so big that the page breaks apart.',
      art: 'paragraph',
    },
  ],
  margins: [
    {
      id: 'margin-type',
      title: 'Tie space to the type',
      body: 'The space inside a box belongs to the type inside it. Compare the padding with the height of one line.',
      art: 'pad-box',
    },
    {
      id: 'margin-even',
      title: 'Make the frame feel even',
      body: 'Even padding on every side looks heavier at the bottom. Judge by eye, not by the ruler.',
      art: 'pad-box',
    },
  ],
  scene: [
    {
      id: 'scene-zoom',
      title: 'Zoom in, then step back',
      body: 'Kern at Zoom to see each pair. Then switch to Fit to check how the headline reads as a whole.',
      art: 'zoom-out',
    },
    {
      id: 'scene-good',
      title: 'Leave the good pairs alone',
      body: 'Some pairs are already right. Moving a right pair costs points, so find the broken pairs first.',
      art: 'keep-good',
    },
    {
      id: 'scene-big',
      title: 'Big type shows every flaw',
      body: 'On a poster or sign, one tight pair stands out from across the room. Start with the widest and tightest gaps.',
      art: 'rhythm',
    },
  ],
  drift: [
    {
      id: 'drift-edge',
      title: 'Follow an edge',
      body: 'Run your eye down the left edge of a column. A block that sticks out of the line has drifted.',
      art: 'grid-edges',
    },
    {
      id: 'drift-axes',
      title: 'Check both directions',
      body: 'A block can drift sideways, up and down, or both. Compare its top and its side with its neighbours.',
      art: 'grid-axes',
    },
    {
      id: 'drift-good',
      title: 'Leave good blocks alone',
      body: 'Most blocks are in place. Moving one that is right costs points, so check before you drag.',
      art: 'keep-good',
    },
  ],
};

/** The tip for a drill. It cycles through the topic's tips as the learner moves through a run. */
export function tipFor(topic: TipTopic, index: number): Tip {
  const pool = TIPS[topic];
  return pool[((index % pool.length) + pool.length) % pool.length];
}

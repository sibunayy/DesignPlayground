import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../App';
import { TIPS, tipFor, TipTopic } from '../content/tips';
import { advanceDrag, dragGain, DragState, GAIN_FAST, GAIN_SLOW, SHIFT_GAIN } from '../components/useHandles';
import { ScoreScale } from '../components/ScoreScale';
import { reviewAnswer } from '../logic/scoring';
import { sanitizeStore, defaultStore } from '../state/storage';

describe('drag gain', () => {
  it('is low for a slow drag, full for a fast drag, and never falls as speed rises', () => {
    expect(dragGain(0)).toBe(GAIN_SLOW);
    expect(dragGain(0.08)).toBeCloseTo(GAIN_SLOW);
    expect(dragGain(5)).toBe(GAIN_FAST);
    let last = 0;
    for (let s = 0; s <= 1.2; s += 0.05) {
      const g = dragGain(s);
      expect(g).toBeGreaterThanOrEqual(last);
      last = g;
    }
  });

  const fresh = (): DragState => ({ pointer: 1, x: 0, y: 0, t: 0, value: 0, perPx: 4, speed: 0 });

  it('moves a slow drag less than a fast drag of the same distance', () => {
    const slow = fresh();
    for (let i = 1; i <= 40; i++) advanceDrag(slow, 'x', i, 0, i * 16);
    const fast = fresh();
    advanceDrag(fast, 'x', 20, 0, 16);
    advanceDrag(fast, 'x', 40, 0, 32);
    expect(slow.x).toBe(40);
    expect(fast.x).toBe(40);
    expect(slow.value).toBeLessThan(fast.value);
    // A slow drag keeps close to the low gain: 40 px at 4 units per px, at about 0.3.
    expect(slow.value).toBeLessThan(40 * 4 * 0.5);
  });

  it('cuts the gain again while Shift is held, and moves the other way on the other direction', () => {
    const a = fresh();
    const b = fresh();
    for (let i = 1; i <= 10; i++) {
      advanceDrag(a, 'x', i, 0, i * 16);
      advanceDrag(b, 'x', i, 0, i * 16, true);
    }
    expect(b.value).toBeCloseTo(a.value * SHIFT_GAIN, 5);
    const c = fresh();
    for (let i = 1; i <= 10; i++) advanceDrag(c, 'x', -i, 0, i * 16);
    expect(c.value).toBeCloseTo(-a.value, 5);
  });
});

describe('lesson tips', () => {
  it('has a short, plain tip for every topic', () => {
    for (const [topic, tips] of Object.entries(TIPS)) {
      expect(tips.length, topic).toBeGreaterThanOrEqual(2);
      for (const t of tips) {
        expect(t.title.split(/\s+/).length, t.id).toBeLessThan(8);
        expect(t.body.split(/\s+/).length, t.id).toBeLessThan(27);
        // A tip teaches a way of looking. It never hands over a number to type in.
        expect(t.body, t.id).not.toMatch(/\d/);
      }
      expect(new Set(tips.map((t) => t.id)).size).toBe(tips.length);
    }
  });

  it('cycles through the topic as the learner moves on', () => {
    const topic: TipTopic = 'kerning';
    const n = TIPS[topic].length;
    expect(tipFor(topic, 0).id).toBe(TIPS[topic][0].id);
    expect(tipFor(topic, n).id).toBe(TIPS[topic][0].id);
    expect(tipFor(topic, -1).id).toBe(TIPS[topic][n - 1].id);
  });

  it('stays open by default and remembers a closed strip', () => {
    expect(defaultStore().tipsOpen).toBe(true);
    expect(sanitizeStore({ version: 1, tipsOpen: false }).tipsOpen).toBe(false);
    expect(sanitizeStore({ version: 1, tipsOpen: 'no' }).tipsOpen).toBe(true);
  });
});

describe('the work area', () => {
  it('shows a tip and a small size preview, and the tip can be hidden', async () => {
    window.localStorage.clear();
    window.location.hash = '#/kerning';
    render(<App />);
    await screen.findAllByRole('slider');
    expect(screen.getByText(tipFor('kerning', 0).title)).toBeTruthy();
    expect(document.querySelector('.dp-preview')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hide tip' }));
    expect(screen.queryByText(tipFor('kerning', 0).body)).toBeNull();
    expect(screen.getByRole('button', { name: 'Show tip' })).toBeTruthy();
    window.location.hash = '';
  });

  it('shows how the score works with one scale row for each spot after lock in', async () => {
    window.localStorage.clear();
    window.location.hash = '#/kerning';
    render(<App />);
    await screen.findAllByRole('slider');
    fireEvent.click(screen.getByRole('button', { name: 'Lock in answer' }));
    expect(screen.getByText('How this score works')).toBeTruthy();
    const rows = document.querySelectorAll('.dp-scale-row');
    // A word of n letters has n - 1 gaps and n - 2 movable letters.
    expect(rows.length).toBe(screen.getAllByRole('slider', { hidden: true }).length + 1);
    window.location.hash = '';
  });
});

describe('ScoreScale', () => {
  it('draws only the spots that counted', () => {
    const t = { lo: -20, hi: 20 };
    const r = reviewAnswer([0, 5, 90], [0, 80, 0], [t, t, t]);
    const { container } = render(<ScoreScale handles={r.handles} labels={['a', 'b', 'c']} />);
    // Handle 0 started right and stayed right, so it does not count. 1 counted. 2 was broken.
    expect(container.querySelectorAll('.dp-scale-row').length).toBe(2);
    expect(container.querySelectorAll('.ss-dot--exact').length).toBe(1);
    expect(container.querySelectorAll('.ss-dot--miss').length).toBe(1);
  });
});

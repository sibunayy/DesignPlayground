import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../App';
import { exercisesFor } from '../content/exercises';
import { dailyPickMode, getMode, MODES } from '../content/modes';
import { buildChallenge } from '../logic/challenge';
import { buildDrift } from '../content/layouts';
import { buildQuiz } from '../logic/quiz';

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  window.location.hash = '';
});

const seedOnScreen = () => /Seed: #(\w{4})/.exec(screen.getByText(/Seed: #/).textContent ?? '')![1];
const lockIn = () => fireEvent.click(screen.getByRole('button', { name: 'Lock in answer' }));
/** Locks in, then leaves the review for the next exercise or the results. */
const lockAndNext = () => {
  lockIn();
  fireEvent.click(screen.getByRole('button', { name: /^(Next|See results)$/ }));
};

/** Presses the arrow keys on a handle until it reads the wanted value. */
function setHandle(name: string | RegExp, want: number) {
  for (let n = 0; n < 200; n++) {
    const el = screen.getByRole('slider', { name });
    const now = Number(el.getAttribute('aria-valuenow'));
    if (Math.abs(want - now) < 0.6) return;
    fireEvent.keyDown(el, { key: want > now ? 'ArrowRight' : 'ArrowLeft', shiftKey: Math.abs(want - now) > 12 });
  }
  throw new Error('handle did not reach its value');
}

describe('Design Playground', () => {
  it('is the default page and has no way back to another app', async () => {
    window.location.hash = '';
    render(<App />);
    expect(await screen.findByText('Train your eye for space.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Back to Sightline|All modes/ })).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: /^Start|^Play again/ })[0]);
    expect(window.location.hash).toBe('#/kerning');
    fireEvent.click(await screen.findByRole('button', { name: 'All modes' }));
    expect(window.location.hash).toBe('#/');
  });

  it('still opens older #/playground links', async () => {
    window.location.hash = '#/playground/leading';
    render(<App />);
    expect(await screen.findByRole('slider', { name: 'Leading' })).toBeTruthy();
  });

  it('gives each practice screen one main landmark and one heading', async () => {
    window.location.hash = '#/playground/leading';
    render(<App />);
    await screen.findByRole('slider', { name: 'Leading' });
    expect(screen.getAllByRole('main')).toHaveLength(1);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(getMode('leading')!.name);
  });

  it('opens Kerning as a seeded challenge with one handle per inner letter and no hints', async () => {
    window.location.hash = '#/playground/kerning';
    const { container } = render(<App />);
    const handles = await screen.findAllByRole('slider');
    const challenge = buildChallenge(exercisesFor('kerning')[0], getMode('kerning')!, seedOnScreen(), 0);
    // The first and last letters are fixed. The letters between them are the handles.
    expect(challenge.pinned).toBe(true);
    expect(handles).toHaveLength(challenge.parts.length - 2);
    expect(screen.getByRole('group', { name: `The word ${challenge.exercise.text}` })).toBeTruthy();
    // A handle reads the position of its letter: the sum of the gaps before it.
    const positions = challenge.parts.slice(1, -1).map((_, k) => challenge.start.slice(0, k + 1).reduce((a, b) => a + b, 0));
    expect(handles.map((h) => Number(h.getAttribute('aria-valuenow')))).toEqual(positions);
    expect(handles.map((h) => h.getAttribute('aria-label'))).toEqual(challenge.parts.slice(1, -1).map((c) => `Letter ${c}`));
    // No bottom dock, no readout, no answer zone, no instruction line.
    expect(container.querySelector('.dp-dock')).toBeNull();
    expect(container.querySelector('input[type="range"]')).toBeNull();
    expect(screen.queryByText(/squares|Correct zone|Drag the slider|Too tight|Too open/)).toBeNull();
    expect(screen.getByText('1 of 6')).toBeTruthy();
  });

  it('shows no hint in any mode', async () => {
    for (const mode of MODES) {
      window.location.hash = `#/playground/${mode.id}`;
      const { container, unmount } = render(<App />);
      await screen.findAllByRole('slider');
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/Correct zone|Drag the slider|Too tight|Too loose|Too open|Balanced|units|squares/);
      expect(container.querySelector('.dp-dock')).toBeNull();
      expect(screen.getByRole('button', { name: 'Lock in answer' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: /Answer zone/ })).toBeNull();
      unmount();
    }
  });

  it('moves a handle with the arrow keys', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    const handle = await screen.findByRole('slider', { name: 'Tracking' });
    const start = Number(handle.getAttribute('aria-valuenow'));
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(start + 1);
    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true });
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(start - 9);
  });

  it('shows a score and notes after lock in, then moves to the next exercise', async () => {
    window.location.hash = '#/playground/leading';
    render(<App />);
    const handle = await screen.findByRole('slider', { name: 'Leading' });
    expect(screen.getByText('1 of 5')).toBeTruthy();
    expect(screen.queryByText('/100')).toBeNull();
    lockIn();
    // Untouched: no points, and the note says so.
    expect(screen.getByText('/100')).toBeTruthy();
    expect(screen.getByText(/You did not move this/)).toBeTruthy();
    // The locked answer does not move.
    const before = handle.getAttribute('aria-valuenow');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle.getAttribute('aria-valuenow')).toBe(before);
    expect(screen.queryByRole('button', { name: 'Lock in answer' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 of 5')).toBeTruthy();
    expect(screen.queryByText('/100')).toBeNull();
  });

  it('lets the learner retry an exercise as practice, and compare with the ideal', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    const handle = await screen.findByRole('slider', { name: 'Tracking' });
    const start = handle.getAttribute('aria-valuenow');
    const challenge = buildChallenge(exercisesFor('tracking')[0], getMode('tracking')!, seedOnScreen(), 0);
    lockIn();
    fireEvent.click(screen.getByRole('button', { name: 'Ideal' }));
    const centre = (challenge.targets[0].lo + challenge.targets[0].hi) / 2;
    expect(Number(screen.getByRole('slider', { name: 'Tracking' }).getAttribute('aria-valuenow'))).toBe(centre);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('slider', { name: 'Tracking' }).getAttribute('aria-valuenow')).toBe(start);
    expect(screen.getByText('1 of 5')).toBeTruthy();
    lockIn();
    expect(screen.getByText('Practice, not scored')).toBeTruthy();
  });

  it('draws the ideal kerning over the answer with one mark per pair', async () => {
    window.location.hash = '#/playground/kerning';
    const { container } = render(<App />);
    const handles = await screen.findAllByRole('slider');
    lockIn();
    expect(container.querySelectorAll('.dp-kw-ghost')).toHaveLength(1);
    // One mark per gap: a word of n letters has n - 1 gaps and n - 2 movable letters.
    expect(container.querySelectorAll('.dp-kw-row:not(.dp-kw-ghost) .dp-mark')).toHaveLength(handles.length + 1);
    expect(screen.getAllByText(/: not moved\./).length).toBe(handles.length + 1);
  });

  it('pins the first and last letters, moves one letter at a time and keeps the word length', async () => {
    window.location.hash = '#/playground/kerning';
    const { container } = render(<App />);
    const handles = await screen.findAllByRole('slider');
    const before = handles.map((h) => Number(h.getAttribute('aria-valuenow')));
    // Two locks, and three guide lines behind the word.
    expect(container.querySelectorAll('.dp-pin')).toHaveLength(2);
    expect(container.querySelectorAll('.dp-kw-line')).toHaveLength(3);
    expect(container.querySelectorAll('.dp-kern-letter--pinned')).toHaveLength(2);
    // One key press moves one letter by one unit. The other letters stay where they are.
    fireEvent.keyDown(handles[0], { key: 'ArrowRight' });
    fireEvent.keyDown(handles[0], { key: 'ArrowRight', shiftKey: true });
    const after = screen.getAllByRole('slider').map((h) => Number(h.getAttribute('aria-valuenow')));
    expect(after[0]).toBe(before[0] + 11);
    expect(after.slice(1)).toEqual(before.slice(1));
    // Pressing a fixed letter says why it does not move.
    fireEvent.pointerDown(container.querySelector('.dp-kern-letter--pinned')!);
    expect(screen.getByRole('status').textContent).toBe('This letter is fixed.');
  });

  it('steps through the lesson and switches modes', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Lesson' }));
    const panel = await screen.findByRole('complementary', { name: getMode('tracking')!.lessonName });
    const prev = within(panel).getByRole('button', { name: 'Previous' }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(within(panel).getByRole('button', { name: 'Next step' }));
    expect(within(panel).getByText('Step 2 of 6')).toBeTruthy();
    expect(prev.disabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Leading' }));
    expect(window.location.hash).toBe('#/leading');
    expect(await screen.findByRole('complementary', { name: getMode('leading')!.lessonName })).toBeTruthy();
  });

  it('opens and hides the lesson panel with the Lesson toggle', async () => {
    window.location.hash = '#/playground/measure';
    render(<App />);
    const toggle = await screen.findByRole('button', { name: 'Lesson' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByRole('complementary')).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByRole('complementary')).toBeTruthy();
    fireEvent.click(toggle);
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('adjusts the selected handle from the fine control popout', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    const handle = await screen.findByRole('slider', { name: 'Tracking' });
    expect(screen.queryByRole('group', { name: 'Fine control' })).toBeNull();
    const toggle = screen.getByRole('button', { name: 'Fine control' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    const start = Number(handle.getAttribute('aria-valuenow'));

    const fine = screen.getByRole('slider', { name: 'Fine control for Tracking' }) as HTMLInputElement;
    // The fine slider rests in the middle, so its thumb shows nothing about the answer.
    expect(Number(fine.value)).toBe(0);
    fireEvent.change(fine, { target: { value: '10' } });
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(start + 10);

    fireEvent.click(screen.getByRole('button', { name: 'Nudge lower' }));
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(start + 9);
    fireEvent.click(toggle);
    expect(screen.queryByRole('group', { name: 'Fine control' })).toBeNull();
  });

  it('shows results only after the last exercise, then saves them to the hub', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    await screen.findByRole('slider', { name: 'Tracking' });
    const mode = getMode('tracking')!;
    const list = exercisesFor('tracking');
    const challenge = buildChallenge(list[0], mode, seedOnScreen(), 0);
    // Set the first exercise to the middle of its target. Lock the rest in untouched.
    setHandle('Tracking', Math.round((challenge.targets[0].lo + challenge.targets[0].hi) / 2));
    for (let i = 0; i < list.length; i++) {
      expect(screen.queryByText(/results, seed/)).toBeNull();
      lockAndNext();
    }
    expect(await screen.findByText(/^Tracking results, seed #/)).toBeTruthy();
    const runScore = Math.round(100 / list.length);
    expect(screen.getByText(new RegExp(`^${runScore}/100\\.`))).toBeTruthy();
    expect(screen.getByText(`1 of ${list.length} in the zone, 1 exact. New best run.`)).toBeTruthy();
    expect(screen.getAllByText(/100 · Exact, 1 of 1 spots/)).toHaveLength(1);
    expect(screen.getAllByText(/^0 · Missed, 0 of 1 spots/)).toHaveLength(list.length - 1);

    fireEvent.click(screen.getByRole('button', { name: 'Choose another mode' }));
    expect(await screen.findByText(new RegExp(`${list.length} of ${list.length} done, 1 exact`))).toBeTruthy();
    expect(screen.getByText(new RegExp(`Best run: ${runScore}/100`))).toBeTruthy();
  });

  it('starts a new run from the summary', async () => {
    window.location.hash = '#/playground/margins';
    render(<App />);
    await screen.findAllByRole('slider');
    for (let i = 0; i < exercisesFor('margins').length; i++) lockAndNext();
    fireEvent.click(await screen.findByRole('button', { name: 'New seed' }));
    await screen.findAllByRole('slider');
    expect(screen.getByText('1 of 5')).toBeTruthy();
    expect(seedOnScreen()).toMatch(/^[0-9A-F]{4}$/);
  });

  it('runs the Margins quiz to the end and saves the best score', async () => {
    window.location.hash = '#/playground/margins/quiz';
    render(<App />);
    const quiz = buildQuiz('margins');
    for (let i = 0; i < quiz.length; i++) {
      expect(await screen.findByText(new RegExp(`Question ${i + 1} of ${quiz.length}`))).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: `Choose sample ${quiz[i].answer === 0 ? 'A' : 'B'}` }));
      expect(screen.getByText(/^Correct\./)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: i === quiz.length - 1 ? 'See your score' : 'Next question' }));
    }
    expect(screen.getByText(`You chose ${quiz.length} of ${quiz.length} correctly.`)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Choose another mode' }));
    expect(await screen.findByText(new RegExp(`Quiz best: ${quiz.length} of ${quiz.length}`))).toBeTruthy();
  });

  it('explains a wrong quiz answer', async () => {
    window.location.hash = '#/playground/kerning/quiz';
    render(<App />);
    const [q] = buildQuiz('kerning');
    fireEvent.click(await screen.findByRole('button', { name: `Choose sample ${q.answer === 0 ? 'B' : 'A'}` }));
    expect(screen.getByText(/^Not this one\./)).toBeTruthy();
  });

  it('opens the quiz from the summary', async () => {
    window.location.hash = '#/playground/margins';
    render(<App />);
    await screen.findAllByRole('slider');
    for (let i = 0; i < exercisesFor('margins').length; i++) lockAndNext();
    fireEvent.click(await screen.findByRole('button', { name: 'Take the Margins quiz' }));
    expect(window.location.hash).toBe('#/margins/quiz');
    expect(await screen.findByText(/Question 1 of/)).toBeTruthy();
  });

  it("opens today's pick from the hub", async () => {
    window.location.hash = '';
    render(<App />);
    const pick = getMode(dailyPickMode(new Date().toISOString().slice(0, 10)))!;
    fireEvent.click(await screen.findByRole('button', { name: `Start ${pick.name}` }));
    expect(window.location.hash).toBe(`#/${pick.id}`);
    expect((await screen.findAllByRole('slider')).length).toBeGreaterThan(0);
  });

  it('opens the real-world kerning work area from the hub and reviews a job', async () => {
    window.location.hash = '';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Kerning on a real page' }));
    expect(window.location.hash).toBe('#/kerning/scene');
    expect(await screen.findByRole('group', { name: /^Headline: / })).toBeTruthy();
    lockIn();
    // Nothing fixed: the broken pairs score nothing.
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next job' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next job' }));
    expect(screen.getByRole('button', { name: 'Lock in answer' })).toBeTruthy();
  });

  it('opens Spot the drift from the hub, scores a fixed page 100 and a page left alone 0', async () => {
    window.location.hash = '';
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start Spot the drift' }));
    expect(window.location.hash).toBe('#/layout/drift');
    const seed = /#(\w{4})/.exec(screen.getByText(/columns · #/).textContent ?? '')![1];
    const layout = buildDrift(seed);
    // Put every drifted block back with the arrow keys.
    layout.blocks.forEach((b, i) => {
      const el = screen.getByRole('button', { name: new RegExp(`^${b.label}\\. Drag it`) });
      const [x, y] = [layout.start[i * 2], layout.start[i * 2 + 1]];
      for (let k = 0; k < Math.abs(x); k++) fireEvent.keyDown(el, { key: x > 0 ? 'ArrowLeft' : 'ArrowRight' });
      for (let k = 0; k < Math.abs(y); k++) fireEvent.keyDown(el, { key: y > 0 ? 'ArrowUp' : 'ArrowDown' });
    });
    lockIn();
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText(/back on the grid/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    lockIn();
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getAllByText(/not moved/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'All modes' }));
    expect(await screen.findByText(/2 played\. Best page: 100\/100/)).toBeTruthy();
  });
});

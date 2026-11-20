import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../App';
import { exercisesFor } from '../content/exercises';
import { getMode } from '../content/modes';

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  window.location.hash = '';
});

describe('Design Playground', () => {
  it('opens from the Sightline home page', async () => {
    window.location.hash = '#/';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /open playground/i }));
    expect(await screen.findByText('Train your eye for space.')).toBeTruthy();
    expect(window.location.hash).toBe('#/playground');
  });

  it('runs the kerning loop: slide, check, next', async () => {
    window.location.hash = '#/playground/kerning';
    render(<App />);
    const mode = getMode('kerning')!;
    const [first] = exercisesFor('kerning');
    const slider = (await screen.findByRole('slider')) as HTMLInputElement;
    expect(Number(slider.value)).toBe(first.start);

    // Too loose first.
    fireEvent.click(screen.getByRole('button', { name: mode.checkLabel }));
    expect(screen.getByText(first.start > first.hi ? mode.feedback.loose : mode.feedback.tight)).toBeTruthy();

    // Then a value inside the zone.
    const step = mode.slider.step;
    const good = mode.slider.min + Math.ceil((first.lo - mode.slider.min) / step) * step;
    fireEvent.change(slider, { target: { value: String(good) } });
    fireEvent.click(screen.getByRole('button', { name: mode.checkLabel }));
    expect(screen.getByText(mode.feedback.good)).toBeTruthy();
    expect(screen.getByText(/Exact answer|In the zone/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: mode.nextLabel }));
    expect(screen.getByText(/Exercise 2 of/)).toBeTruthy();
    expect(Number((screen.getByRole('slider') as HTMLInputElement).value)).toBe(exercisesFor('kerning')[1].start);
  });

  it('steps through the lesson and switches modes', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    const panel = await screen.findByRole('complementary', { name: getMode('tracking')!.lessonName });
    const prev = within(panel).getByRole('button', { name: 'Previous' }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(within(panel).getByRole('button', { name: 'Next step' }));
    expect(within(panel).getByText('Step 2 of 6')).toBeTruthy();
    expect(prev.disabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Leading' }));
    expect(window.location.hash).toBe('#/playground/leading');
    expect(await screen.findByRole('complementary', { name: getMode('leading')!.lessonName })).toBeTruthy();
  });

  it('hides the lesson panel with the Lesson toggle', async () => {
    window.location.hash = '#/playground/measure';
    render(<App />);
    const toggle = await screen.findByRole('button', { name: 'Lesson' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggle);
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('moves the slider one step with the fine-tune buttons', async () => {
    window.location.hash = '#/playground/tracking';
    render(<App />);
    const mode = getMode('tracking')!;
    const slider = (await screen.findByRole('slider')) as HTMLInputElement;
    const start = Number(slider.value);
    fireEvent.click(screen.getByRole('button', { name: 'Increase by one step' }));
    expect(Number(slider.value)).toBe(start + mode.slider.step);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease by one step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decrease by one step' }));
    expect(Number(slider.value)).toBe(start - mode.slider.step);
  });

  it('runs the Paragraphs mode and shows the grade on the hub', async () => {
    window.location.hash = '#/playground/paragraph';
    render(<App />);
    const mode = getMode('paragraph')!;
    const [first] = exercisesFor('paragraph');
    const slider = (await screen.findByRole('slider')) as HTMLInputElement;
    const centre = Math.round((first.lo + first.hi) / 2 / mode.slider.step) * mode.slider.step;
    fireEvent.change(slider, { target: { value: String(centre) } });
    fireEvent.click(screen.getByRole('button', { name: mode.checkLabel }));
    expect(screen.getByText('Exact answer.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'All modes' }));
    expect(await screen.findByText(new RegExp(`1 of ${exercisesFor('paragraph').length} done, 1 exact`))).toBeTruthy();
  });
});

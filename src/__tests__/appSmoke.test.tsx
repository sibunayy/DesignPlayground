import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { LESSONS } from '../data/lessons';

describe('Sightline UI & Anti-Slop Interactive Smoke Suite', () => {
  it('renders Home Index with all 13 lessons and toggles Darkroom theme cleanly', () => {
    window.location.hash = '#/';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Sightline/i);

    for (const lesson of LESSONS) {
      expect(screen.getAllByText(lesson.title).length).toBeGreaterThanOrEqual(1);
    }

    const themeBtn = screen.getByRole('button', {
      name: /Toggle studio light or darkroom mode/i,
    });
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('cycles through all 13 exercises (Learn -> Practice -> Fine Sliders -> Check Evaluation) with zero crashes', () => {
    for (const lesson of LESSONS) {
      window.location.hash = `#/lesson/${lesson.id}/learn`;
      const { unmount } = render(<App />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(lesson.title);
      expect(screen.getAllByText(lesson.styleWorld).length).toBeGreaterThanOrEqual(1);

      const practiceBtn = screen.getByRole('button', { name: /Practice Interactive Lab/i });
      fireEvent.click(practiceBtn);

      expect(screen.queryByText(/Closeness Score/i)).toBeNull();

      const submitBtn = screen.getByRole('button', { name: /Check Evaluation/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Closeness Score/i)).toBeInTheDocument();
      expect(screen.getByText(/Critique Note/i)).toBeInTheDocument();
      unmount();
    }
  });

  it('launches Daily 5-Min Calibration and completes Drill 1/5', () => {
    window.location.hash = '#/daily';
    render(<App />);
    expect(screen.getByText(/Mix 1\/5/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /Check Evaluation/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Closeness Score/i)).toBeInTheDocument();
  });
});

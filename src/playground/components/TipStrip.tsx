import React from 'react';
import type { Tip } from '../content/tips';
import { TipArt } from './TipArt';

interface TipStripProps {
  tip: Tip;
  open: boolean;
  onToggle: () => void;
  /** Content for the end of the strip, such as a live preview. */
  aside?: React.ReactNode;
}

/** A short lesson above the work: a small diagram, a title and one or two sentences. */
export const TipStrip: React.FC<TipStripProps> = ({ tip, open, onToggle, aside }) => (
  <section className={`dp-tip${open ? '' : ' dp-tip--closed'}`} aria-label="Quick tip">
    {open ? (
      <>
        <div className="dp-tip-art">
          <TipArt kind={tip.art} />
        </div>
        <div className="dp-tip-text">
          <h2 className="dp-tip-title">{tip.title}</h2>
          <p className="dp-tip-body">{tip.body}</p>
        </div>
        {aside}
      </>
    ) : (
      <p className="dp-tip-title dp-tip-title--closed">{tip.title}</p>
    )}
    <button type="button" className="dp-tip-toggle" aria-expanded={open} onClick={onToggle}>
      {open ? 'Hide tip' : 'Show tip'}
    </button>
  </section>
);

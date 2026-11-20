import React from 'react';
import { LessonVisual as Visual } from '../types';

/** Draws a lesson visual from data. Equal numbers in the data draw equal space. */
export const LessonVisual: React.FC<{ visual: Visual }> = ({ visual }) => {
  switch (visual.kind) {
    case 'kernPairs':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {visual.items.map((item, i) => (
              <div
                key={i}
                className="dp-kern-word"
                style={{ fontSize: visual.size }}
              >
                <span>{item.left}</span>
                <span
                  className="dp-gap"
                  style={{
                    width: `${item.gapEm}em`,
                    height: '0.66em',
                    borderRadius: 4,
                    background: 'var(--accent-tint-strong)',
                  }}
                />
                <span>{item.right}</span>
                {item.label && <span className="dp-vis-label" style={{ marginLeft: 16 }}>{item.label}</span>}
              </div>
            ))}
          </div>
          {visual.caption && <div className="dp-vis-label">{visual.caption}</div>}
        </div>
      );

    case 'textRows':
      return (
        <div className="dp-vis-stack">
          {visual.rows.map((row, i) => (
            <div className="dp-vis-row" key={i}>
              <span
                style={{
                  fontSize: visual.size,
                  fontWeight: 800,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  letterSpacing: `${(row.tracking ?? 0) / 1000}em`,
                  wordSpacing: `${(row.wordSpacing ?? 0) / 1000}em`,
                  filter: visual.blur ? 'blur(1.6px)' : undefined,
                }}
              >
                {row.text}
              </span>
              <span className="dp-vis-label">{row.label}</span>
            </div>
          ))}
        </div>
      );

    case 'lineCols':
      return (
        <div className="dp-vis-cols">
          {visual.cols.map((col, i) => (
            <div key={i}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: col.size ?? visual.size,
                  lineHeight: col.lineHeight,
                  filter: visual.blur ? 'blur(1.4px)' : undefined,
                }}
              >
                Aa
                <br />
                Aa
                <br />
                Aa
              </div>
              <div className="dp-vis-label" style={{ marginTop: 6 }}>{col.label}</div>
            </div>
          ))}
        </div>
      );

    case 'measureLines':
      return (
        <div className="dp-vis-stack" style={{ fontSize: visual.size }}>
          {visual.rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="dp-measure-line" style={{ width: `${row.ch}ch`, flexShrink: 0 }} />
              <span className="dp-vis-label">{row.label}</span>
            </div>
          ))}
        </div>
      );

    case 'paraCols': {
      // One line is 12px: an 8px bar and a 4px line gap. Paragraph gaps add whole lines.
      const LINE = 12;
      const widths = [100, 100, 60];
      return (
        <div className="dp-vis-cols">
          {visual.cols.map((col, i) => (
            <div key={i} style={{ width: 96 }}>
              {[0, 1, 2].map((para) => (
                <div key={para} style={{ marginTop: para === 0 ? 0 : col.gaps[para - 1] * LINE }}>
                  {widths.map((w, line) => (
                    <div
                      key={line}
                      style={{
                        height: 8,
                        marginBottom: 4,
                        borderRadius: 2,
                        background: 'var(--accent-tint-strong)',
                        width: `${w - (col.indent && para > 0 && line === 0 ? 20 : 0)}%`,
                        marginLeft: col.indent && para > 0 && line === 0 ? '20%' : 0,
                      }}
                    />
                  ))}
                </div>
              ))}
              <div className="dp-vis-label" style={{ marginTop: 6 }}>{col.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case 'blurWord':
      return (
        <div style={{ fontSize: visual.size, fontWeight: 800, lineHeight: 1, filter: 'blur(5px)' }}>
          {visual.text}
        </div>
      );

    case 'pairList':
      return (
        <div style={{ display: 'flex', gap: 30, fontSize: visual.size, fontWeight: 800, lineHeight: 1 }}>
          {visual.items.map((pair) => (
            <span key={pair}>{pair}</span>
          ))}
        </div>
      );
  }
};

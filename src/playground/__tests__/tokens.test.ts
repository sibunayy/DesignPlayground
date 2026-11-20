import { describe, expect, it } from 'vitest';
import sourceText from '../../../design/design-playground/design-system/tokens.json?raw';
import css from '../styles/tokens.css?raw';

const source = JSON.parse(sourceText) as {
  color: { tokens: Array<{ name: string; value: Record<string, string> }> };
};

function themeBlock(theme: string): Record<string, string> {
  const match = css.match(new RegExp(`\\.dp\\[data-theme='${theme}'\\]\\s*\\{([^}]*)\\}`));
  const out: Record<string, string> = {};
  for (const m of (match?.[1] ?? '').matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

describe('playground tokens', () => {
  for (const theme of ['dark', 'light']) {
    it(`${theme} colours match the design system source`, () => {
      const block = themeBlock(theme);
      // Hex values only. Values such as {mode-kerning} are references that the CSS resolves per mode.
      const colorTokens = source.color.tokens.filter((t) => /^#[0-9a-f]{3,8}$/i.test(t.value?.[theme] ?? ''));
      expect(colorTokens.length).toBeGreaterThan(5);
      // The tints are color-mix() of the accent. Their alpha must match the source hex alpha.
      const tintVar: Record<string, string> = {
        'accent-tint': 'tint-strength',
        'accent-tint-strong': 'tint-strong-strength',
      };
      for (const token of colorTokens) {
        if (tintVar[token.name]) {
          const alpha = parseInt(token.value[theme].slice(7, 9), 16) / 255;
          const pct = parseFloat(block[tintVar[token.name]]);
          expect(Math.abs(alpha * 100 - pct)).toBeLessThan(1);
          continue;
        }
        expect({ name: token.name, value: block[token.name]?.toUpperCase() }).toEqual({
          name: token.name,
          value: token.value[theme].toUpperCase(),
        });
      }
    });
  }
});

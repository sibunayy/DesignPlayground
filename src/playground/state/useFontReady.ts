import { useEffect, useState } from 'react';
import { FontSpec, fontReady, loadFont } from '../logic/fonts';

/**
 * True once the typeface is loaded and can be measured. The kerning answer key comes from the
 * loaded font, so a challenge is built again when this turns true.
 */
export function useFontReady(font: FontSpec | undefined): boolean {
  const [loaded, setLoaded] = useState<string | null>(null);
  const ready = !font || loaded === font.id || fontReady(font);
  useEffect(() => {
    if (!font || ready) return;
    let live = true;
    void loadFont(font).then(() => {
      if (live) setLoaded(font.id);
    });
    return () => {
      live = false;
    };
  }, [font, ready]);
  return ready;
}

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
};

async function loadFont(url: URL) {
  const font = await readFile(url);
  return font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer;
}

export async function getOgFonts(): Promise<OgFont[]> {
  const spaceMono = await loadFont(new URL('./fonts/SpaceMono-Regular.ttf', import.meta.url));

  return [
    { name: 'Space Mono', data: spaceMono, weight: 400, style: 'normal' },
  ];
}
import { readFile } from 'node:fs/promises';

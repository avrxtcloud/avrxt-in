type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
};

async function loadFont(url: URL) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url.toString()} (${response.status})`);
  }
  return response.arrayBuffer();
}

export async function getOgFonts(): Promise<OgFont[]> {
  const spaceMono = await loadFont(new URL('./fonts/SpaceMono-Regular.ttf', import.meta.url));

  return [
    { name: 'Space Mono', data: spaceMono, weight: 400, style: 'normal' },
  ];
}

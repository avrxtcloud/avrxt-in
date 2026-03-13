type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
};

async function loadFont(relativePath: string) {
  const response = await fetch(new URL(relativePath, import.meta.url));
  if (!response.ok) {
    throw new Error(`Failed to load font: ${relativePath} (${response.status})`);
  }
  return response.arrayBuffer();
}

export async function getOgFonts(): Promise<OgFont[]> {
  const [outfit, spaceMono] = await Promise.all([
    loadFont('./fonts/Outfit-Variable.ttf'),
    loadFont('./fonts/SpaceMono-Regular.ttf'),
  ]);

  return [
    { name: 'Outfit', data: outfit, weight: 400, style: 'normal' },
    { name: 'Outfit', data: outfit, weight: 800, style: 'normal' },
    { name: 'Space Mono', data: spaceMono, weight: 400, style: 'normal' },
  ];
}

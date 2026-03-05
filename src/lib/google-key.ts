export function getGooglePrivateKey(raw: string | undefined): string | null {
  if (!raw) return null;

  let key = raw.trim();

  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  if (key.startsWith('{') && key.includes('private_key')) {
    try {
      const parsed = JSON.parse(key) as { private_key?: string };
      if (parsed.private_key) key = parsed.private_key;
    } catch {
      const match = key.match(/"private_key"\s*:\s*"([\s\S]*?)"/);
      if (match?.[1]) key = match[1];
    }
  }

  key = key.replace(/\\n/g, '\n');

  if (!key.includes('BEGIN') && /^[A-Za-z0-9+/=\r\n]+$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8').trim();
      if (decoded.includes('private_key')) {
        const parsed = JSON.parse(decoded) as { private_key?: string };
        if (parsed.private_key) {
          key = parsed.private_key.replace(/\\n/g, '\n');
        }
      } else if (decoded.includes('BEGIN') && decoded.includes('PRIVATE KEY')) {
        key = decoded;
      }
    } catch {
      // keep original value
    }
  }

  key = key.replace(/\r\n/g, '\n').trim();

  // Normalize PEM spacing/body corruption from env providers/editors.
  const beginMatch = key.match(/-----BEGIN [^-]+-----/);
  const endMatch = key.match(/-----END [^-]+-----/);

  if (beginMatch && endMatch) {
    const begin = beginMatch[0];
    const end = endMatch[0];

    const startIndex = key.indexOf(begin) + begin.length;
    const endIndex = key.indexOf(end);
    const bodyRaw = key.slice(startIndex, endIndex);

    // Keep only base64 characters. This removes spaces/tabs/accidental junk.
    const bodyClean = bodyRaw.replace(/[^A-Za-z0-9+/=]/g, '');

    // Re-wrap as canonical PEM body (64 chars per line).
    const bodyWrapped = bodyClean.match(/.{1,64}/g)?.join('\n') ?? '';

    if (bodyWrapped.length > 0) {
      key = `${begin}\n${bodyWrapped}\n${end}`;
    }
  }

  return key;
}

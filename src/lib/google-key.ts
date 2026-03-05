export function getGooglePrivateKey(raw: string | undefined): string | null {
  if (!raw) return null;

  let key = raw.trim();

  // Some dashboards wrap multiline secrets in quotes.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // If full JSON credentials are pasted, extract private_key.
  if (key.startsWith('{') && key.includes('private_key')) {
    try {
      const parsed = JSON.parse(key) as { private_key?: string };
      if (parsed.private_key) {
        key = parsed.private_key;
      }
    } catch {
      const match = key.match(/"private_key"\s*:\s*"([\s\S]*?)"/);
      if (match?.[1]) {
        key = match[1];
      }
    }
  }

  // Standard escaped newlines from env vars.
  key = key.replace(/\\n/g, '\n');

  // Support base64-encoded private key env values.
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
      // Keep original key if decode fails.
    }
  }

  // Normalize line endings to LF for OpenSSL compatibility.
  key = key.replace(/\r\n/g, '\n').trim();

  return key;
}

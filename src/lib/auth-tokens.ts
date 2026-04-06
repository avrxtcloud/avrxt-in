import { createHmac } from "crypto";

const SECRET = process.env.BETTER_AUTH_SECRET || "fallback_secret_for_dev_purpose_only";

/**
 * Signs a source string to prevent tampering in the login query parameter.
 */
export function signSource(source: string): string {
    const hmac = createHmac("sha256", SECRET);
    hmac.update(source);
    const signature = hmac.digest("hex").substring(0, 16);
    return `${source}_${signature}`;
}

/**
 * Verifies a signed source string. 
 * Returns the original source if valid, otherwise null.
 */
export function verifySource(signedSource: string | null): string | null {
    if (!signedSource || typeof signedSource !== 'string') return null;
    
    const parts = signedSource.split("_");
    if (parts.length < 2) return null;
    
    const signature = parts.pop();
    const source = parts.join("_");
    
    const hmac = createHmac("sha256", SECRET);
    hmac.update(source);
    const expectedSignature = hmac.digest("hex").substring(0, 16);
    
    return signature === expectedSignature ? source : null;
}

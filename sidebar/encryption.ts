export async function generateAndStoreSecretKey() {
  const { secretKey } = await chrome.storage.local.get('secretKey');
  if (secretKey) return console.log("key exists");
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
  chrome.storage.local.set({ secretKey: exportedKey });
}


// encryption.ts
export async function encryptApiKey(apiKey: string): Promise<string> {
  const { secretKey } = await chrome.storage.local.get('secretKey');
  if (!secretKey) throw new Error('Secret key not found');

  const key = await window.crypto.subtle.importKey(
    'jwk',
    secretKey,
    { name: 'AES-GCM' },
    true,
    ['encrypt']
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);

  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

  // Combine IV and encrypted data into a single string
  const ivString = btoa(String.fromCharCode(...iv));
  const encryptedString = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return `${ivString}:${encryptedString}`;
}


// encryption.ts
export async function decryptApiKey(encryptedData: string): Promise<string> {
  const { secretKey } = await chrome.storage.local.get('secretKey');
  if (!secretKey) throw new Error('Secret key not found');

  const key = await window.crypto.subtle.importKey(
    'jwk',
    secretKey,
    { name: 'AES-GCM' },
    true,
    ['decrypt']
  );

  const [ivString, encryptedString] = encryptedData.split(':');
  const iv = Uint8Array.from(atob(ivString), c => c.charCodeAt(0));
  const encrypted = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

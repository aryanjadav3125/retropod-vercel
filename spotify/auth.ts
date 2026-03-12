function getClientId() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || localStorage.getItem('spotify_client_id_override') || '';
  }
  return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
}

const REDIRECT_URI = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_REDIRECT_URI! : 'http://localhost:3000/callback';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-recently-played',
  'user-top-read',
].join(' ');

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map(v => chars[v % chars.length]).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function initiateSpotifyLogin() {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_code_verifier', verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: getClientId(),
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'false',
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const verifier = localStorage.getItem('spotify_code_verifier');
  if (!verifier) throw new Error('No code verifier found');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getClientId(),
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Token exchange failed');
  }

  const data = await response.json();
  const expiresAt = Date.now() + data.expires_in * 1000;

  localStorage.setItem('spotify_access_token', data.access_token);
  localStorage.setItem('spotify_token_expires_at', String(expiresAt));
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  localStorage.removeItem('spotify_code_verifier');

  return data.access_token;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: getClientId(),
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.setItem('spotify_token_expires_at', String(expiresAt));
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }

    return data.access_token;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_token_expires_at');

  if (!token || !expiresAt) return null;
  if (Date.now() > parseInt(expiresAt) - 60000) return null; // expired or about to

  return token;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function logout() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expires_at');
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_device_id');
}

# 🎵 RetroPod

> A nostalgic iPod Classic interface powered by Spotify streaming — open source, free, deployable on Vercel.

![RetroPod Screenshot](public/screenshot.png)

## Features

- 🎨 **Pixel-perfect iPod Classic UI** — realistic silver/white body, LCD screen, click wheel
- 🎡 **Interactive Click Wheel** — drag to scroll, click zones for controls (also keyboard shortcuts)
- 🎵 **Spotify Integration** — full Web Playback SDK, OAuth PKCE, search, playlists, recommendations
- 📋 **Full Menu Navigation** — Music, Playlists, Queue, Genius/Recommendations, Now Playing, Settings
- 🖼️ **Album Art** — live album artwork display in screen and menu sidebar
- ⌨️ **Keyboard Shortcuts** — ↑↓ navigate, Enter select, Esc back, Space play/pause, ←→ skip
- 🚀 **Vercel Ready** — zero-config deployment
- 🆓 **Free & Open Source** — no paid APIs required

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/retropod.git
cd retropod
npm install
```

### 2. Set Up Spotify

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Fill in:
   - App name: `RetroPod`
   - Redirect URI: `http://localhost:3000/callback`
4. Copy your **Client ID**

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** Spotify Premium is required for in-browser playback via the Web Playback SDK. Free accounts can browse and search.

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` = your client ID
   - `NEXT_PUBLIC_REDIRECT_URI` = `https://your-app.vercel.app/callback`
4. Deploy
5. Add `https://your-app.vercel.app/callback` to your Spotify app's Redirect URIs

---

## Click Wheel Controls

| Action | Wheel | Keyboard |
|--------|-------|----------|
| Scroll up | Drag counter-clockwise | ↑ |
| Scroll down | Drag clockwise | ↓ |
| Select | Center button | Enter |
| Back/Menu | MENU zone (top) | Esc |
| Play/Pause | ▶⏸ zone (bottom) | Space |
| Next track | ⏭ zone (right) | → |
| Previous track | ⏮ zone (left) | ← |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Animation | Framer Motion |
| State | Zustand |
| Auth | Spotify OAuth 2.0 PKCE |
| Playback | Spotify Web Playback SDK |
| Deploy | Vercel |

---

## Project Structure

```
retropod/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page + login screen
│   ├── login/page.tsx      # Login redirect
│   └── callback/page.tsx   # OAuth callback
├── components/
│   ├── Ipod.tsx            # Main iPod body + logic
│   ├── Menu.tsx            # Screen content (menu lists, transitions)
│   ├── ClickWheel.tsx      # Click wheel UI
│   ├── NowPlaying.tsx      # Now playing screen
│   └── AlbumArt.tsx        # Album art display
├── spotify/
│   ├── auth.ts             # PKCE OAuth flow
│   ├── api.ts              # Spotify Web API calls
│   └── player.ts           # Web Playback SDK types
├── hooks/
│   ├── useSpotifyPlayer.ts # Player initialization hook
│   └── useClickWheel.ts    # Wheel drag + keyboard handler
├── store/
│   └── playerStore.ts      # Zustand global state
├── styles/
│   └── globals.css         # Global styles
└── utils/
    └── spotifyHelpers.ts   # Formatters + demo data
```

---

## Demo Mode

No Spotify account? Click **Try Demo Mode** on the login screen to explore the full UI with sample tracks. All navigation, click wheel interaction, and now-playing screens work without any API connection.

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — free to use, modify, and distribute.

---

*"I am using a real iPod again, but with unlimited modern music."*

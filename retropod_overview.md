# RetroPod: Application Overview

## Concept
RetroPod is a web-based application that meticulously recreates the nostalgic interface and experience of the classic iPod, combined with modern music streaming capabilities powered by Spotify. It offers users a retro feeling of click-wheel navigation while seamlessly playing music from their Spotify library directly in the browser. 

The application is perfect for users who want a distraction-free, physical-feeling interface to browse their music, playlists, and queue, coupled with modern web convenience.

## Core Features
1. **Pixel-Perfect iPod Classic UI**: High-fidelity recreation of the classic silver/white body and the LCD screen.
2. **Interactive Click Wheel**: 
   - A fully functional wheel where users can drag in a circular motion to scroll through menus.
   - Click zones on the wheel for Menu (Top), Play/Pause (Bottom), Next (Right), and Previous (Left).
   - Keyboard bypass shortcuts for accessibility (Arrows, Enter, Esc, Space).
3. **Spotify Delivery**:
   - Uses **Spotify OAuth 2.0 PKCE** for secure, serverless authentication.
   - Direct browser streaming via **Spotify Web Playback SDK** (requires Premium).
4. **Authentic Menu Navigation**: Mimics the classic iPod menu tree, featuring Music, Playlists, Queue, Now Playing, and Settings.
5. **Demo Mode**: Allows users without a Spotify Premium account to fully explore the UI and click-wheel interactions with sample track data.

## Technical Architecture

The application is a modern single-page-like experience built on a robust React ecosystem:

- **Framework**: Built with **Next.js 14** using the modern **App Router** (`app/` directory).
- **Language**: Strictly typed using **TypeScript** for maintainability.
- **State Management**: Uses **Zustand** ([store/playerStore.ts](file:///c:/Users/Aryan/Downloads/retropod/store/playerStore.ts)) to manage global playback state, menu depth, and currently active selections without complex boilerplate.
- **Styling**: **TailwindCSS** handles all the responsive structural and utility styling, rapidly matching the bespoke iPod layouts.
- **Animations**: **Framer Motion** powers smooth menu transitions, list sliding, and active-state visual feedback.

### Key Components
- **`Ipod.tsx`**: The master container handling the device body and layout.
- **`ClickWheel.tsx`**: Computes angular drag math and handles all touch/mouse events for circular scrolling.
- **`Menu.tsx`**: Orchestrates the nested list rendering and horizontal sliding animations.
- **`spotify/` Directory**: Contains pure functions for the auth flow (`auth.ts`), API requests (`api.ts`), and Web Playback SDK initialization (`player.ts`).

## Deployment
RetroPod requires zero backend server configuration. As it utilizes standard React components and Next.js static/client features primarily, it is fully optimized for one-click deployment to **Vercel**. Environment variables only require a Spotify Client ID and an approved Redirect URI, making it highly accessible for any developer to host themselves for free.

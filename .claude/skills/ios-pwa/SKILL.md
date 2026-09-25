---
name: ios-pwa
description: iPhone Safari PWA rules for Japan Companion — manifest and icons, service worker and offline caching on a GitHub Pages sub-path, Add to Home Screen, speechSynthesis (Japanese voice) quirks, screen wake lock, safe-area insets and standalone-mode pitfalls. Use when touching vite.config.ts, the manifest, the service worker, audio, full-screen show-cards, or when something "works in Chrome but not on the iPhone".
---

# iPhone PWA rules

Both users run iPhones and will use the app installed to the Home Screen,
often offline. Chrome desktop behaves differently, so check against these
rules.

## Install and offline

- `vite-plugin-pwa` with `registerType: 'autoUpdate'` and
  `workbox.globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}']`.
  Everything the app needs must be precached. No runtime-only content.
- Vite `base: './'`. The app must work from any sub-path (GitHub Pages
  serves at `/<repo>/...`). Never use absolute `/` URLs in code, the
  manifest or icons.
- Manifest: `display: 'standalone'`, `start_url: '.'`, `scope: '.'`,
  plus 192/512 PNG icons **and** a 180×180 `apple-touch-icon` link in
  `index.html`. iOS ignores manifest icons for the home-screen icon.
- iOS has no install prompt. The Guide tab shows the steps: Safari →
  Share → Add to Home Screen.
- Exchange-rate fetch is the only network call. It is **not** cached by the
  service worker (it's a cross-origin API). The app caches it in
  `localStorage` itself.
- iOS may evict storage for sites not opened for weeks. Installed PWAs are
  exempt, which is one more reason to install.

## Layout

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Pad with `env(safe-area-inset-*)`: bottom tab bar gets
  `padding-bottom: env(safe-area-inset-bottom)`.
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
  and a `theme-color` for light and dark.
- Inputs need `font-size >= 16px`, or iOS zooms in on focus.
- For the converter keypad use `inputmode="decimal"`, or better, our own
  keypad buttons (no keyboard popping up).
- Tap targets are at least 44×44 px.

## Japanese speech (speechSynthesis)

All speech goes through `lib/speech.ts` and the `<SpeakButtons>` component.
Never call `speechSynthesis` directly from a component.

- **Speak `ja` (kanji), never `kana`.** Kana-only text loses word boundaries and
  the particle は is read "ha". This was the "not Japanese-sounding" bug.
- `speechSynthesis.getVoices()` is **empty on first call** on iOS, so read it on
  every speak and listen for `voiceschanged` (also retry after 500 ms, since iOS
  sometimes never fires it).
- `pickVoice()` ranks Japanese voices (Premium > Enhanced > Google > compact,
  local first) and honours the user's choice (`jc.voiceURI`). It **never** uses
  a non-Japanese voice. With no Japanese voice, `speakJapanese` returns
  `'no-voice'` and the UI shows a toast pointing to Guide → Japanese voice.
- Normal rate 0.9, 🐢 slow 0.6; the default is stored in `jc.slowSpeech`.
- Must be triggered by a user tap (no autoplay).
- Natural voices must be downloaded on the iPhone: Settings → Accessibility →
  Spoken Content → Voices → Japanese → Kyoko (Enhanced) / O-ren (Premium).
- The smoke test injects a fake `speechSynthesis` to assert the text, `ja-JP`,
  the chosen voice and the slow rate.

## Show-card (full screen)

- Screen wake lock: `navigator.wakeLock?.request('screen')` inside
  try/catch. Supported in Safari 16.4+, but may throw in standalone mode
  on older iOS. Silently ignore any failure.
- Rotate-to-face button: CSS `transform: rotate(180deg)` on the card text,
  not device orientation APIs.
- Font: `font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", system-ui`.
  Size with `clamp()` so long phrases still fit.

## Testing

- Unit: `npm test` (vitest).
- Visual: see the `release-check` skill (Playwright with an iPhone 15
  viewport, both languages, offline reload).

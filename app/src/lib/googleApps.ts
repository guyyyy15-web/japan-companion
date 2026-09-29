// Hand-offs to Google's own apps. Google blocks embedding Translate and Lens in other sites, so the app
// opens them instead: the web page always works; the app links need the app installed.

export type TranslateLang = 'iw' | 'ja' | 'en'

/** Google Translate on the web, pre-filled. Works on any phone, with or without the app. */
export function translateWebUrl(text: string, from: TranslateLang, to: TranslateLang): string {
  return `https://translate.google.com/?sl=${from}&tl=${to}&text=${encodeURIComponent(text)}&op=translate`
}

/** The Google Translate iPhone app, pre-filled (its long-standing URL scheme). */
export function translateAppUrl(text: string, from: TranslateLang, to: TranslateLang): string {
  return `googletranslate://?sl=${from}&tl=${to}&text=${encodeURIComponent(text)}`
}

/** Opens the Google Translate app as is (for Camera, Conversation and handwriting). */
export const TRANSLATE_APP = 'googletranslate://'
/** Google Lens inside the Google app. */
export const LENS_APP = 'googleapp://lens'
export const LENS_WEB = 'https://lens.google/'
export const TRANSLATE_STORE = 'https://apps.apple.com/app/google-translate/id414706506'
export const GOOGLE_STORE = 'https://apps.apple.com/app/google/id284815942'

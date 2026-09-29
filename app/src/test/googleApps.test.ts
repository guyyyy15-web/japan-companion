import { describe, expect, it } from 'vitest'
import { translateAppUrl, translateWebUrl } from '../lib/googleApps'

describe('Google hand-off links', () => {
  it('pre-fills Google Translate on the web and in the app', () => {
    expect(translateWebUrl('איפה השירותים?', 'iw', 'ja')).toBe(
      'https://translate.google.com/?sl=iw&tl=ja&text=%D7%90%D7%99%D7%A4%D7%94%20%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D%3F&op=translate',
    )
    expect(translateAppUrl('トイレはどこですか', 'ja', 'iw')).toBe(
      'googletranslate://?sl=ja&tl=iw&text=%E3%83%88%E3%82%A4%E3%83%AC%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E3%81%99%E3%81%8B',
    )
  })
})

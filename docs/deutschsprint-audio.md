# DeutschSprint: PDF-to-audio integration

The book companion lives at `/deutschsprint`. Every printed recording ID has a permanent, case-insensitive route. Print the lowercase canonical URL in QR codes **only after the corresponding route is available on the live domain and verified**.

| Printed ID | Permanent route | Recording scope |
| --- | --- | --- |
| A1-01-01 | `/audio/a1-01-01` | Alphabet names and examples |
| A1-01-02 | `/audio/a1-01-02` | Ä, Ö, Ü, ß and examples |
| A1-01-03 | `/audio/a1-01-03` | Sound combinations and comparisons |
| A1-01-04 | `/audio/a1-01-04` | Dialogue and name spelling |

## Publishing a recording

1. Record the exact content from the approved book page; review German pronunciation and sequence.
2. Place the MP3 in `public/media/deutschsprint/`, for example `a1-01-01-v1.mp3`. Alternatively use a real, public HTTPS MP3 URL.
3. Set `source` for that ID in `src/data/deutschsprintAudio.js` (e.g. `/media/deutschsprint/a1-01-01-v1.mp3`). Leave it `null` until the approved file exists.
4. Run `npm run check:deutschsprint` and `npm run build`. After deployment, open the permanent page on mobile, play and seek within the recording, check speed and repeat, and test the QR code from the printed PDF.

Never reuse a printed ID for other content. Replace a recording by changing its `source` to a new versioned file, without changing the permanent page URL. No account, database migration, microphone permissions, or autoplay is required. The pending state intentionally does not attempt to synthesize substitute audio.

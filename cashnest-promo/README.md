# CashNest promo videos

A standalone Remotion project, not part of the app build. Screen only: no device
frame. Output is 1170x2532 (a 390x844 phone screen at 3x), 60 fps, silent, ready
for a phone mockup and a voice-over.

Everything inside the app is the app's own rendering, including the popups: the
frames come from the real Flutter screens (see `capture/README.md`), so components,
colours, fonts, icons and motion are exact. Only the status bar is drawn here
(delete the marked block in `src/Overview.tsx` if your mockup has its own).

## Overview video

`npm run render` writes `out/overview.mp4` (also committed as `overview.mp4`).
No zoom, no tap markers.

| Scene | What happens |
|---|---|
| Home | The real Home reveals: header, hero card, Recent transactions one by one |
| Detecting | The app's own popups: "Payment detected", then "Payment saved". The Starbucks expense lands and the totals update |
| Expense details | Tap the new row: the details load component by component, with the location |
| Splits | The Splits list, "+", New split typed end to end, the Notify sheet with WhatsApp and SMS, Done |
| Bills | The Bills list with due dates and "Pay", then a bill's details and payment history |

Whenever a screen opens, its components load one by one over the page background,
header first, like the splash (`src/Reveal.tsx`); the real frames play before and
after. The order and every cut come from the capture log (`src/tour.events.json`)
through `src/timeline.ts`.

`public/seq` (about 500 MB of PNG frames) is not committed: regenerate it with the capture step.
Colours are encoded as BT.709 with PNG frames (see `remotion.config.ts`).

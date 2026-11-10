# Capturing the real app screens

The video does not redraw the app. `public/seq/<clip>/` holds PNG frames (30 fps,
1170x2532 = a 390x844 phone screen at 3x) rendered by the **real Flutter screens**
of the cashnest app, driven by Flutter widget tests with fake data and scripted
taps, typing and scrolling. Nothing in the cashnest repo is changed.

| Test | What it plays | Frames |
|---|---|---|
| `tour_a_test.dart` | Home (real staged reveal), a new expense landing, nav pill to Splits, the Splits list, "+", the whole New split flow, the Notify sheet (SMS / WhatsApp), Done | 941 |
| `split_flow_test.dart` | Only the New split flow, for fast iteration | about 400 |

`flows.dart` holds the reusable flows, `fakes.dart` the fake providers and
`harness.dart` the screen pump, the fonts, the PNG capture and `Rec`, a recorder
that saves every frame and logs every tap (in output pixels) for the video.

## Run

```bash
# 1. a scratch copy of cashnest main (Flutter 3.47+), never the real repo
mkdir -p /tmp/app && tar --exclude=.git --exclude=android --exclude=ios -cf - -C <cashnest> . | tar -xf - -C /tmp/app
cp capture/*.dart /tmp/app/test/promo/        # create the folder first
capture/prepare.sh /tmp/app                   # capture-only patches, see below
(cd /tmp/app && flutter pub get)

# 2. capture (run.sh sets a timezone where the local hour is 9, so Home says "Morning")
capture/run.sh /tmp/app tour_a
# frames: /tmp/promo_seq/tourA/0000.png ...   events: /tmp/promo_seq/tourA_events.json

# 3. next to the video project
cp -r /tmp/promo_seq/tourA public/seq/part1
cp /tmp/promo_seq/tourA_events.json src/part1.events.json
```

## Capture-only patches (scratch copy only, `prepare.sh`)

- The Home "Location detection" card is hidden: the state of a user who already turned automatic location on.
- `HomeScreenState.of` returns a detached state outside the real shell, so the "+" button can open New split.
- New split carries phone numbers for the typed friends: stands in for picking them from contacts, so the Notify sheet shows SMS and WhatsApp.

## Known quirks

- The tests print an `app_links` plugin message at the start; it is harmless.
- Tapping a send button in the Notify sheet hits the app's invite rate limiter, which cannot run in a test, so the flow shows the sheet and does not tap them.
- `harness.dart` reads the Material icon font from `/home/user/tools/flutter/...`: adjust that path on another machine.

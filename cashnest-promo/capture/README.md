# Capturing the real app screens

The video does not redraw the app. `public/seq/tour/` holds PNG frames (60 fps,
1170x2532 = a 390x844 phone screen at 3x) rendered by the **real Flutter screens**
of the cashnest app, driven by one Flutter widget test with fake data and scripted
taps, typing and scrolling. Nothing in the cashnest repo is changed.

`tour_test.dart` plays: Home (real staged reveal), the app's own popups ("Payment
detected", "Payment saved"), the new expense landing, its details with the location,
the nav pill to Splits, the Splits list, "+", the whole New split flow, the Notify
sheet (SMS / WhatsApp), Done, the nav pill to Bills, the Bills list and one bill's details.

`flows.dart` has the New split flow, `fakes.dart` the fake providers, `bills_data.dart`
the demo bills, and `harness.dart` the screen pump, fonts, PNG capture and `Rec`: a
recorder that saves every frame, logs every tap and, with `settled(screen)`, writes the
rectangles of a finished screen's components (cards and rows) for the reveal in the video.

## Run

```bash
# 1. a scratch copy of cashnest main (Flutter 3.47+), never the real repo
mkdir -p /tmp/app && tar --exclude=.git --exclude=android --exclude=ios -cf - -C <cashnest> . | tar -xf - -C /tmp/app
mkdir -p /tmp/app/test/promo && cp capture/*.dart /tmp/app/test/promo/
capture/prepare.sh /tmp/app                   # capture-only patches, see below
(cd /tmp/app && flutter pub get)

# 2. capture (run.sh sets a timezone where the local hour is 9, so Home says "Morning")
capture/run.sh /tmp/app tour
# frames: /tmp/promo_seq/tour/0000.png ...   log: /tmp/promo_seq/tour_events.json

# 3. next to the video project
cp -r /tmp/promo_seq/tour public/seq/tour
cp /tmp/promo_seq/tour_events.json src/tour.events.json
```

## Capture-only patches (scratch copy only, `prepare.sh`)

- The Home "Location detection" card is hidden: the state of a user who already turned automatic location on.
- `HomeScreenState.of` returns a detached state outside the real shell, so "+" and row taps can push screens.
- New split carries phone numbers for the typed friends: stands in for picking them from contacts, so the Notify sheet shows SMS and WhatsApp.
- A bill's Payment history returns demo payments (the real call needs the network).

## Known quirks

- The test prints an `app_links` plugin message at the start; it is harmless.
- Tapping a send button in the Notify sheet hits the app's invite rate limiter, which cannot run in a test, so the flow shows the sheet and does not tap them.
- `harness.dart` reads the Material icon font from `/home/user/tools/flutter/...`: adjust that path on another machine.

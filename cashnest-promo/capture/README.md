# Capturing the real app screens

The promo does not redraw the app. `public/seq/` holds PNG frames (30 fps,
1170x2532 = 390x844 at 3x) rendered by the **real Flutter screens** of the
cashnest app, driven by Flutter widget tests with fake data.

| Test | Screen | Frames |
|---|---|---|
| `home_test.dart` | `HomeDashboard` + `CustomNavigationBar`; the new Starbucks expense lands at frame 24 | 100 |
| `details_test.dart` | `ExpenseDetailsScreen` | 75 |
| `splash_test.dart` | `SplashScreen` (logo, icon orbit, "Let's Start") | 150 |

`fakes.dart` holds fake providers, `harness.dart` the screen pump, font loading
and PNG capture. Nothing in the cashnest repo is changed.

## Run

```bash
# 1. a scratch copy of cashnest (any recent main), Flutter 3.47+
cp -r capture/*.dart <cashnest>/test/promo/
cd <cashnest> && flutter pub get

# 2. capture (TZ makes the greeting say "Morning"; the clock is 9:41 AM there)
export TZ=Etc/GMT+8
for t in home details splash; do flutter test test/promo/${t}_test.dart; done
# frames land in /tmp/promo_seq (override with --dart-define=PROMO_OUT=...)

# 3. copy them next to the video project
cp -r /tmp/promo_seq/{home,details,splash} public/seq/
cp /tmp/promo_seq/home_rects.json public/seq/
```

The tests may print a Supabase/services exception after the last frame; the
frames are already written by then.

`harness.dart` reads `/home/user/tools/flutter/...` for the Material icon font
and `assets/google_fonts/Inter-*.ttf` relative to the cashnest repo: adjust the
first path for your machine.

#!/usr/bin/env bash
# Usage: capture/prepare.sh <scratch copy of cashnest> 
# Capture-only patch applied to the SCRATCH COPY (never to the real repo):
# the Home "Location detection" card is hidden, which is the state of a user
# who already turned automatic location on.
set -euo pipefail
APP="$1"
python3 - "$APP/lib/widgets/auto_location_home_card.dart" <<'PY'
import sys,re
p=sys.argv[1]; s=open(p).read()
if "CAPTURE-PATCH" not in s:
    s=s.replace("}) =>\n    isSubscriptionLoaded &&","}) =>\n    false && // CAPTURE-PATCH: card hidden for the promo\n    isSubscriptionLoaded &&",1)
    open(p,'w').write(s)
PY
python3 - "$APP/lib/screens/home_screen.dart" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
if "CAPTURE-PATCH" not in s:
    s=s.replace("""    return state!;
  }

  // Static method to safely access""","""    // CAPTURE-PATCH: outside the real shell (the capture shell) use a detached state
    return state ?? (_captureStub ??= HomeScreenState());
  }

  static HomeScreenState? _captureStub;

  // Static method to safely access""",1)
    open(p,'w').write(s)
PY
python3 - "$APP/lib/screens/new_split_screen.dart" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
if "CAPTURE-PATCH" not in s:
    # people carry phone numbers, as if picked from the contacts list
    s=s.replace("class NewSplitScreen extends StatefulWidget {","/// CAPTURE-PATCH: phone numbers for typed people (stands in for the contacts picker)\nMap<String, String> capturePhones = {};\n\nclass NewSplitScreen extends StatefulWidget {",1)
    old="""        phoneNumbers: _participantPhones.isNotEmpty
            ? Map.unmodifiable(_participantPhones)
            : null,"""
    new="""        phoneNumbers: {..._participantPhones, ...capturePhones}.isNotEmpty
            ? Map.unmodifiable({..._participantPhones, ...capturePhones})
            : null,"""
    assert old in s
    s=s.replace(old,new,1)
    open(p,'w').write(s)
PY
grep -n "CAPTURE-PATCH" "$APP/lib/widgets/auto_location_home_card.dart" "$APP/lib/screens/new_split_screen.dart"

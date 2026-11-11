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
python3 - "$APP/lib/screens/home_screen.dart" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
if "captureNavVisible" not in s:
    s=s.replace("class HomeScreen extends StatefulWidget {","/// CAPTURE-PATCH: the detached shell state reports nav bar visibility here\nfinal ValueNotifier<bool> captureNavVisible = ValueNotifier<bool>(true);\n\nclass HomeScreen extends StatefulWidget {",1)
    s=s.replace("  void setNavBarVisibility(bool isVisible) {\n    if (!mounted) return;","  void setNavBarVisibility(bool isVisible) {\n    if (!mounted) {\n      captureNavVisible.value = isVisible; // CAPTURE-PATCH\n      return;\n    }",1)
    s=s.replace("  bool get isNavBarVisible => _isNavBarVisible;","  bool get isNavBarVisible => mounted ? _isNavBarVisible : captureNavVisible.value; // CAPTURE-PATCH",1)
    open(p,'w').write(s)
PY
python3 - "$APP/lib/widgets/home_shortcuts_panel.dart" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
if "CAPTURE-PATCH" not in s:
    # the Bills / Goals / Assets labels set no font, so they use the platform default,
    # which the test environment lacks (they draw as blocks): use the app's Inter
    s=s.replace("import 'package:flutter/material.dart';","import 'package:flutter/material.dart';\nimport 'package:google_fonts/google_fonts.dart'; // CAPTURE-PATCH",1)
    s=s.replace("                style: TextStyle(\n                  fontSize: 12.5,","                style: GoogleFonts.inter( // CAPTURE-PATCH\n                  fontSize: 12.5,",1)
    open(p,'w').write(s)
PY
python3 - "$APP/lib/widgets/ui/bubble_fab.dart" "$APP/lib/screens/home_dashboard.dart" <<'PY'
import sys,re
# The round buttons can be hidden for one frame, so the video can load a screen's
# components first and pop the button in last.
def patch(path, cls, first):
    s=open(path).read()
    if "captureHideFabs" in s: return
    i=s.index(cls)
    j=s.index("  Widget build(BuildContext context) {", i)
    s=s[:j]+"""  Widget build(BuildContext context) => ValueListenableBuilder<bool>(
        valueListenable: captureHideFabs, // CAPTURE-PATCH
        builder: (c, hide, _) => hide ? const SizedBox.shrink() : _captureBuild(c),
      );

  Widget _captureBuild(BuildContext context) {"""+s[j+len("  Widget build(BuildContext context) {"):]
    if first:
        s+="\n/// CAPTURE-PATCH: true hides the round buttons\nfinal ValueNotifier<bool> captureHideFabs = ValueNotifier<bool>(false);\n"
    open(path,'w').write(s)
patch(sys.argv[1],"class _BubbleFabState",True)
patch(sys.argv[2],"class _FabBubbleButtonState",False)
h=open(sys.argv[2]).read()
if "ui/bubble_fab.dart" not in h:
    h=h.replace("import 'package:flutter/material.dart';","import 'package:flutter/material.dart';\nimport 'package:cashnest/widgets/ui/bubble_fab.dart' show captureHideFabs; // CAPTURE-PATCH",1)
    open(sys.argv[2],'w').write(h)
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
python3 - "$APP/lib/services/recurring_bill_service.dart" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
if "CAPTURE-PATCH" not in s:
    s=s.replace("class BillPaymentHistory {","/// CAPTURE-PATCH: demo payment history (the real call needs the network)\nList<BillPaymentHistory>? captureHistory;\n\nclass BillPaymentHistory {",1)
    s=s.replace("  Future<List<BillPaymentHistory>> fetchPaymentHistory(String billId) async {","  Future<List<BillPaymentHistory>> fetchPaymentHistory(String billId) async {\n    if (captureHistory != null) return captureHistory!; // CAPTURE-PATCH",1)
    open(p,'w').write(s)
PY
grep -n "CAPTURE-PATCH" "$APP/lib/widgets/auto_location_home_card.dart" "$APP/lib/screens/new_split_screen.dart" "$APP/lib/services/recurring_bill_service.dart" "$APP/lib/screens/home_screen.dart"

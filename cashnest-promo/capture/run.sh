#!/usr/bin/env bash
# Usage: capture/run.sh <scratch copy of cashnest> <test name> [more tests...]
# Sets a timezone in which the local hour is 9 (the greeting says "Morning"),
# then runs the given capture tests. Frames land in $PROMO_SEQ (default /tmp/promo_seq).
set -uo pipefail
APP="$1"; shift
H=$(date -u +%H); H=$((10#$H))
if [ "$H" -ge 9 ] && [ "$H" -le 21 ]; then TZNAME="Etc/GMT+$((H-9))"; else M=$(( (9 - H + 24) % 24 )); TZNAME="Etc/GMT-$M"; fi
export TZ="$TZNAME" CI=true PATH="${FLUTTER_BIN:-/home/user/tools/flutter/bin}:$PATH"
cd "$APP"
for t in "$@"; do echo "== $t (TZ=$TZ)"; flutter test "test/promo/${t}_test.dart" 2>&1 | grep -E "EXCEPTION|NoSuch|Tried calling|Error:|\+1|\-1" | grep -v "available)" | sort | uniq -c | head -12; done

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:cashnest/screens/splash_screen.dart';

import 'harness.dart';

void main() {
  testWidgets('splash', (tester) async {
    await loadFonts();
    SharedPreferences.setMockInitialValues({});
    await tester.runAsync(() async {
      try {
        await Supabase.initialize(
            url: 'https://example.supabase.co', anonKey: 'anon');
      } catch (e) {
        // ignore: avoid_print
        print('SUPABASE INIT: $e');
      }
    });
    final key = await pumpScreen(
      tester,
      const SplashScreen(signedOut: true),
      providers: [],
    );
    final ex = tester.takeException();
    // ignore: avoid_print
    if (ex != null) print('EXCEPTION: $ex');
    await record(tester, key, 'splash', frames: 150);
    await finish(tester);
  });
}

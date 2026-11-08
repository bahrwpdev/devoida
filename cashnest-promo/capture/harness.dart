import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';

import 'package:cashnest/constants/app_theme.dart';
import 'package:cashnest/providers/budget_cycle_provider.dart';
import 'package:cashnest/providers/budget_provider.dart';
import 'package:cashnest/providers/currency_provider.dart';
import 'package:cashnest/providers/expense_provider.dart';
import 'package:cashnest/providers/profile_provider.dart';
import 'package:cashnest/providers/split_provider.dart';

/// iPhone 390x844 logical at 3x = 1170x2532 physical.
const Size kLogical = Size(390, 844);
const double kDpr = 3;
const String kOut = String.fromEnvironment('PROMO_OUT', defaultValue: '/tmp/promo_seq');

Future<void> loadFonts() async {
  debugDefaultTargetPlatformOverride = TargetPlatform.iOS;
  GoogleFonts.config.allowRuntimeFetching = false;
  final icons = File(
      '/home/user/tools/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf');
  final loader = FontLoader('MaterialIcons')
    ..addFont(Future.value(ByteData.view(icons.readAsBytesSync().buffer)));
  await loader.load();
  // Text that inherits the platform default font would otherwise fall back to
  // Ahem (blocks) in the test environment: give those families Inter.
  for (final family in ['Roboto', '.SF UI Text', '.SF Pro Text', 'CupertinoSystemText']) {
    final fl = FontLoader(family);
    for (final w in ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold']) {
      final f = File('assets/google_fonts/Inter-$w.ttf');
      fl.addFont(Future.value(ByteData.view(f.readAsBytesSync().buffer)));
    }
    await fl.load();
  }
}

class FakeCurrency extends ChangeNotifier implements CurrencyProvider {
  @override
  String get currentCurrency => 'USD';
  @override
  bool get homeCurrencyKnown => true;
  @override
  bool get isLoading => false;
  @override
  String getCurrencySymbol() => '\$';
  @override
  String formatAmount(double amount) {
    final neg = amount < 0;
    final fixed = amount.abs().toStringAsFixed(2);
    final parts = fixed.split('.');
    final intPart = parts[0].replaceAllMapped(
        RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',');
    return '${neg ? '-' : ''}\$$intPart.${parts[1]}';
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

/// Wraps [screen] in the app's theme and fake providers; sized like an iPhone.
Future<GlobalKey> pumpScreen(
  WidgetTester tester,
  Widget screen, {
  required List<SingleChildWidget> providers,
}) async {
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = kDpr;
  tester.view.padding = const FakeViewPadding(top: 47 * kDpr, bottom: 34 * kDpr);
  tester.view.viewPadding =
      const FakeViewPadding(top: 47 * kDpr, bottom: 34 * kDpr);
  addTearDown(tester.view.reset);
  final key = GlobalKey();
  final app = MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: AppTheme.newTheme,
    home: RepaintBoundary(key: key, child: screen),
  );
  await tester.pumpWidget(
      providers.isEmpty ? app : MultiProvider(providers: providers, child: app));
  await tester.pump();
  await tester.runAsync(() => GoogleFonts.pendingFonts());
  await tester.pump();
  return key;
}

int _n = 0;

/// Saves the current frame as <kOut>/<name>_<index>.png.
Future<void> shot(WidgetTester tester, GlobalKey key, String name, int index) async {
  await tester.runAsync(() async {
    await GoogleFonts.pendingFonts();
    final boundary =
        key.currentContext!.findRenderObject() as RenderRepaintBoundary;
    final ui.Image img = await boundary.toImage(pixelRatio: kDpr);
    final data = await img.toByteData(format: ui.ImageByteFormat.png);
    final dir = Directory('$kOut/$name')..createSync(recursive: true);
    File('${dir.path}/${index.toString().padLeft(4, '0')}.png')
        .writeAsBytesSync(data!.buffer.asUint8List());
    _n++;
  });
}

/// Advances 1/30 s per frame and saves every frame.
Future<void> record(WidgetTester tester, GlobalKey key, String name,
    {required int frames, int start = 0}) async {
  for (var i = 0; i < frames; i++) {
    await tester.pump(const Duration(milliseconds: 1000 ~/ 30));
    await shot(tester, key, name, start + i);
  }
}

/// Unmounts the screen, flushes timers and restores the platform override.
Future<void> finish(WidgetTester tester) async {
  await tester.pumpWidget(const SizedBox());
  await tester.pump(const Duration(seconds: 6));
  debugDefaultTargetPlatformOverride = null;
}

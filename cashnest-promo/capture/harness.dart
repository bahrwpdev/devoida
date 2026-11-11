import 'dart:convert';
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
    // the boundary wraps the whole app, so sheets, dialogs and popups are captured too
    builder: (context, child) => RepaintBoundary(key: key, child: child),
    home: screen,
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

/// Records one continuous clip: every frame is saved, and taps/marks are logged
/// (in output pixels) so the video can draw tap markers and time the scenes.
/// Frames per second of every recording.
const int kFps = 60;

/// Seconds to frames.
int sec(double s) => (s * kFps).round();

class Rec {
  Rec(this.tester, this.key, this.name);
  final WidgetTester tester;
  final GlobalKey key;
  final String name;
  int frame = 0;
  final List<Map<String, dynamic>> events = [];

  void mark(String label, [Offset? at]) => events.add({
        'name': label,
        'frame': frame,
        if (at != null) 'x': (at.dx * kDpr).round(),
        if (at != null) 'y': (at.dy * kDpr).round(),
      });

  /// Advances [n] frames (1/60 s each) and saves each. A tiny real-time wait per
  /// frame lets real async work (file/network failures) finish.
  Future<void> frames(int n) async {
    for (var i = 0; i < n; i++) {
      await tester.pump(const Duration(microseconds: 16667));
      await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 3)));
      await shot(tester, key, name, frame++);
      final ex = tester.takeException();
      // ignore: avoid_print
      if (ex != null) print('EXCEPTION @$frame: ${ex.toString().split('\n').first}');
    }
  }

  Future<void> tap(String label, Finder f) async {
    final c = tester.getCenter(f.first);
    mark(label, c);
    await tester.tapAt(c);
  }

  Future<void> tapAt(String label, Offset c) async {
    mark(label, c);
    await tester.tapAt(c);
  }

  /// Types [text] into [f] one character at a time, [every] frames apart.
  Future<void> type(Finder f, String text, {int every = 2}) async {
    for (var i = 1; i <= text.length; i++) {
      await tester.enterText(f.first, text.substring(0, i));
      await frames(every);
    }
  }

  /// A finger drag of [dy] logical px (negative = scroll down) over [steps] frames.
  Future<void> drag(Finder f, double dy, int steps) async {
    final g = await tester.startGesture(tester.getCenter(f.first));
    for (var i = 0; i < steps; i++) {
      await g.moveBy(Offset(0, dy / steps));
      await frames(1);
    }
    await g.up();
  }

  /// Marks a screen as fully loaded and writes the rectangles of its components
  /// (white cards and rows), in output pixels, so the video can load them one by
  /// one. [bottom] is the logical y where fixed bottom bars begin.
  void settled(String screen, {double bottom = 760}) {
    final units = <Rect>[];
    void visit(Element e) {
      final w = e.widget;
      Decoration? d;
      if (w is Container) d = w.decoration;
      if (w is DecoratedBox) d = w.decoration;
      if (d is BoxDecoration && d.color != null && d.color!.toARGB32() == 0xFFFFFFFF) {
        final br = d.borderRadius;
        if (br is BorderRadius && br.topLeft.x >= 10 && br.topLeft.x <= 16) {
          final ro = e.renderObject;
          if (ro is RenderBox && ro.hasSize && ro.attached) {
            final r = ro.localToGlobal(Offset.zero) & ro.size;
            if (r.width >= 250 && r.height >= 36 && r.top >= 40 && r.bottom <= bottom + 6) units.add(r);
          }
        }
      }
      e.visitChildren(visit);
    }
    tester.binding.rootElement!.visitChildren(visit);
    // outermost only, top to bottom
    final outer = units
        .where((a) => !units.any((b) => !identical(a, b) && b.contains(a.topLeft) && b.contains(a.bottomRight) && (b.size.width > a.size.width || b.size.height > a.size.height)))
        .toList()
      ..sort((a, b) => a.top.compareTo(b.top));
    final merged = <Rect>[];
    for (final r in outer) {
      if (merged.isNotEmpty && (merged.last.top - r.top).abs() < 2 && (merged.last.bottom - r.bottom).abs() < 2) continue;
      merged.add(r);
    }
    events.add({
      'name': 'settled:$screen',
      'frame': frame - 1,
      'bottom': (bottom * kDpr).round(),
      'units': [for (final r in merged) [(r.left * kDpr).round(), (r.top * kDpr).round(), (r.width * kDpr).round(), (r.height * kDpr).round()]],
    });
  }

  void save() => File('$kOut/${name}_events.json').writeAsStringSync(
      '${const JsonEncoder.withIndent(' ').convert(events)}\n');
}

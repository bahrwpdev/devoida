import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:cashnest/screens/new_split_screen.dart' show capturePhones;
import 'package:cashnest/utils/amount_input_formatter.dart';

import 'harness.dart';

/// Platform channels the real screens touch: url_launcher answers "yes" (WhatsApp
/// and Messages are installed); path_provider points at a temp folder.
void mockLauncher() {
  Directory('/tmp/promo_docs').createSync(recursive: true);
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(const MethodChannel('plugins.flutter.io/path_provider'),
          (call) async => '/tmp/promo_docs');
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(const MethodChannel('plugins.flutter.io/url_launcher'),
          (call) async => call.method == 'canLaunch' || call.method == 'launch');
}

/// The New split flow on the real screen, fast: name, amount, tax, tip, two friends,
/// scroll to the shares, Save Bill & Notify, hold on the Notify sheet, Done.
/// Starts with the screen already loaded.
Future<void> splitFlow(WidgetTester tester, Rec r) async {
  capturePhones = {'Sarah': '+15551230101', 'Mike': '+15551230102'};

  final amountField = find.byWidgetPredicate((w) =>
      w is TextField &&
      (w.inputFormatters ?? const []).any((f) => f is AmountInputFormatter));
  Finder hint(String h) =>
      find.byWidgetPredicate((w) => w is TextField && w.decoration?.hintText == h);

  /// The n-th "0.00" amount box, top to bottom (0 = bill, 1 = tax, 2 = tip).
  Finder zeroBox(int n) {
    final boxes = find
        .byWidgetPredicate((w) => w is TextField && w.decoration?.hintText == '0.00')
        .evaluate()
        .map((e) => e.widget as TextField)
        .toList()
      ..sort((a, b) => tester.getRect(find.byWidget(a)).top.compareTo(tester.getRect(find.byWidget(b)).top));
    final ctrl = boxes[n].controller;
    return find.byWidgetPredicate((w) => w is TextField && identical(w.controller, ctrl));
  }

  // name
  await r.tapAt('tapName', tester.getCenter(find.byType(TextField).first));
  await r.type(find.byType(TextField).first, 'Dinner at Nobu', every: 3);
  await r.frames(sec(0.1));
  // amount
  await r.tap('tapAmount', amountField);
  for (final t in ['8', '86', '86.', '86.4', '86.40']) {
    await tester.enterText(amountField.first, t);
    await r.frames(5);
  }
  await r.frames(sec(0.15));
  // tax
  await r.tap('tapTax', find.text('+ Tax'));
  await r.frames(sec(0.35));
  await r.type(zeroBox(1), '7.20', every: 5);
  await r.frames(sec(0.1));
  // tip
  await r.tap('tapTip', find.text('+ Tip'));
  await r.frames(sec(0.35));
  await r.type(zeroBox(2), '9.00', every: 5);
  await r.frames(sec(0.15));
  // friends
  for (final name in ['Sarah', 'Mike']) {
    while (tester.getCenter(find.text('New person').first).dy > 600) {
      await r.drag(find.byType(SingleChildScrollView).first, -90, sec(0.16));
      await r.frames(sec(0.05));
    }
    await r.tap('tapNewPerson', find.text('New person'));
    await r.frames(sec(0.3));
    await r.type(hint('Friend${name == 'Sarah' ? 1 : 2}'), name, every: 3);
    await r.frames(sec(0.1));
  }
  await r.drag(find.byType(SingleChildScrollView).first, -260, sec(0.4));
  await r.frames(sec(0.45));
  await r.tap('tapSave', find.text('Save Bill & Notify'));
  await r.frames(sec(1.7)); // the sheet rises and the people resolve one by one
  await r.frames(sec(1.8)); // hold on the Notify sheet: WhatsApp and SMS
  await r.tap('tapDone', find.text('Done'));
  await r.frames(sec(0.6));
}

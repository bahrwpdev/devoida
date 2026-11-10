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

/// The New split flow, played on the real screen: name, amount, tax, tip, two
/// friends, scroll to see their shares, Save Bill & Notify. [pace] stretches the
/// timing (1 = fast).
Future<void> splitFlow(WidgetTester tester, Rec r, {double pace = 1.0}) async {
  await splitFlowUntilSave(tester, r, pace: pace);
  await r.tap('tapSave', find.text('Save Bill & Notify'));
  await r.frames(46); // the sheet rises and the people resolve one by one
  await r.frames(64); // hold on the resolved Notify sheet
  await r.tap('tapDone', find.text('Done'));
  await r.frames(24);
}

/// Everything up to (not including) the Save tap.
Future<void> splitFlowUntilSave(WidgetTester tester, Rec r, {double pace = 1.0}) async {
  int p(int n) => (n * pace).round();
  capturePhones = {'Sarah': '+15551230101', 'Mike': '+15551230102'};

  final amountField = find.byWidgetPredicate((w) =>
      w is TextField &&
      (w.inputFormatters ?? const []).any((f) => f is AmountInputFormatter));
  Finder hint(String h) =>
      find.byWidgetPredicate((w) => w is TextField && w.decoration?.hintText == h);

  await r.frames(p(10));
  // name
  await r.tapAt('tapName', tester.getCenter(find.byType(TextField).first));
  await r.type(find.byType(TextField).first, 'Dinner at Nobu', every: p(2));
  await r.frames(p(6));
  // amount
  await r.tap('tapAmount', amountField);
  for (final t in ['8', '86', '86.', '86.4', '86.40']) {
    await tester.enterText(amountField.first, t);
    await r.frames(p(4));
  }
  await r.frames(p(8));
  // tax
  await r.tap('tapTax', find.text('+ Tax'));
  await r.frames(p(14));
  /// The n-th "0.00" amount box, top to bottom (0 = bill, 1 = tax, 2 = tip).
  Finder zeroBox(int n) {
    final boxes = find
        .byWidgetPredicate((w) => w is TextField && w.decoration?.hintText == '0.00')
        .evaluate()
        .map((e) => e.widget as TextField)
        .toList()
      ..sort((a, b) => tester
          .getRect(find.byWidget(a))
          .top
          .compareTo(tester.getRect(find.byWidget(b)).top));
    final ctrl = boxes[n].controller;
    return find.byWidgetPredicate((w) => w is TextField && identical(w.controller, ctrl));
  }

  final taxAmount = zeroBox(1);
  await r.type(taxAmount, '7.20', every: p(3));
  await r.frames(p(6));
  // tip
  await r.tap('tapTip', find.text('+ Tip'));
  await r.frames(p(14));
  final tipAmount = zeroBox(2);
  await r.type(tipAmount, '9.00', every: p(3));
  await r.frames(p(8));
  // friends
  for (final name in ['Sarah', 'Mike']) {
    // keep the button above the action bar
    while (tester.getCenter(find.text('New person').first).dy > 600) {
      await r.drag(find.byType(SingleChildScrollView).first, -90, p(8));
      await r.frames(p(4));
    }
    await r.tap('tapNewPerson', find.text('New person'));
    await r.frames(p(12));
    final nameField = hint('Friend${name == 'Sarah' ? 1 : 2}');
    await r.type(nameField, name, every: p(2));
    await r.frames(p(6));
  }
  await r.frames(p(10));
  // scroll to the shares, then save
  await r.drag(find.byType(SingleChildScrollView).first, -260, p(14));
  await r.frames(p(24));
}

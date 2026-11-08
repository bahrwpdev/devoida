import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:cashnest/constants/app_theme.dart';
import 'package:cashnest/models/expense.dart';
import 'package:cashnest/models/split.dart' as app_split;
import 'package:cashnest/providers/asset_provider.dart';
import 'package:cashnest/providers/budget_cycle_provider.dart';
import 'package:cashnest/providers/budget_provider.dart';
import 'package:cashnest/providers/currency_provider.dart';
import 'package:cashnest/providers/expense_provider.dart';
import 'package:cashnest/providers/goal_provider.dart';
import 'package:cashnest/providers/insights_provider.dart';
import 'package:cashnest/providers/leftover_provider.dart';
import 'package:cashnest/providers/monthly_budget_provider.dart';
import 'package:cashnest/providers/notification_provider.dart';
import 'package:cashnest/providers/profile_provider.dart';
import 'package:cashnest/providers/recurring_bill_provider.dart';
import 'package:cashnest/providers/sms_detection_provider.dart';
import 'package:cashnest/providers/split_provider.dart';
import 'package:cashnest/providers/subscription_provider.dart';
import 'package:cashnest/providers/user_provider.dart';
import 'package:cashnest/screens/home_dashboard.dart';
import 'package:cashnest/widgets/auto_location_home_card.dart';
import 'package:cashnest/widgets/custom_navigation_bar.dart';

import 'fakes.dart';
import 'harness.dart';

DateTime _at(int day, int h, int m) => DateTime(2026, 11, day, h, m);

Expense _e(String id, String name, double amt, String cat, DateTime at) =>
    Expense(
      id: id,
      expenseName: name,
      amount: amt,
      category: cat,
      description: '',
      date: at,
      createdAt: at,
    );

void main() {
  testWidgets('home', (tester) async {
    await loadFonts();
    SharedPreferences.setMockInitialValues({});
    await tester.runAsync(() async {
      await Supabase.initialize(
          url: 'https://example.supabase.co', anonKey: 'anon');
    });
    final expenses = FakeExpenses()
      ..list = [
        _e('1', 'Uber', 14.20, 'Transport', _at(8, 8, 12)),
        _e('2', 'Whole Foods', 63.40, 'Groceries', _at(7, 18, 30)),
        _e('3', 'Netflix', 15.49, 'Entertainment', _at(6, 12, 0)),
        _e('4', 'Shell', 42.00, 'Transport', _at(5, 17, 10)),
        _e('5', 'Blue Bottle', 5.50, 'Coffee', _at(5, 9, 2)),
        _e('6', 'Zara', 143.00, 'Shopping', _at(3, 15, 0)),
        _e('7', 'Electricity bill', 128.71, 'Bills & Utilities', _at(2, 10, 0)),
      ];
    final splits = FakeSplits()
      ..list = [
        app_split.Split(
          id: 's1',
          billName: 'Weekend trip',
          totalAmount: 412,
          sharedCosts: 0,
          paidAmount: 412,
          participants: const ['Rashad', 'Sarah', 'Mike', 'Lina'],
          participantAmounts: const {},
          isCustomSplit: false,
          addToExpenses: false,
          date: _at(7, 20, 0),
          createdAt: _at(7, 20, 0),
        ),
      ];
    final key = await pumpScreen(
      tester,
      Scaffold(
        backgroundColor: AppTheme.pageBackground,
        body: const HomeDashboard(),
        bottomNavigationBar:
            CustomNavigationBar(currentIndex: 0, onTap: (_) {}),
      ),
      providers: [
        ChangeNotifierProvider<CurrencyProvider>.value(value: FakeCurrency()),
        ChangeNotifierProvider<ExpenseProvider>.value(value: expenses),
        ChangeNotifierProvider<SplitProvider>.value(value: splits),
        ChangeNotifierProvider<BudgetProvider>.value(value: FakeBudgets()),
        ChangeNotifierProvider<BudgetCycleProvider>.value(value: FakeCycles()),
        ChangeNotifierProvider<MonthlyBudgetProvider>.value(
            value: FakeMonthly(2000)),
        ChangeNotifierProvider<GoalProvider>.value(value: FakeGoals()),
        ChangeNotifierProvider<AssetProvider>.value(value: FakeAssets()),
        ChangeNotifierProvider<RecurringBillProvider>.value(value: FakeBills()),
        ChangeNotifierProvider<SubscriptionProvider>.value(
            value: FakeSubscription()),
        ChangeNotifierProvider<UserProvider>.value(value: FakeUser()),
        ChangeNotifierProvider<ProfileProvider>.value(value: FakeProfile()),
        ChangeNotifierProvider<SmsDetectionProvider>.value(value: FakeSms()),
        ChangeNotifierProvider<NotificationProvider>.value(
            value: FakeNotifications()),
        ChangeNotifierProvider<InsightsProvider>.value(value: FakeInsights()),
        ChangeNotifierProvider<LeftoverProvider>.value(value: FakeLeftover()),
      ],
    );
    for (var i = 0; i < 4; i++) {
      final ex = tester.takeException();
      // ignore: avoid_print
      if (ex != null) print('EXCEPTION: $ex');
      await tester.pump(const Duration(milliseconds: 33));
    }
    // Let the dashboard settle (the real staged reveal), unrecorded.
    for (var i = 0; i < 170; i++) {
      await tester.pump(const Duration(milliseconds: 1000 ~/ 30));
    }
    final closeBtn = find.descendant(
        of: find.byType(AutoLocationHomeCard), matching: find.byIcon(Icons.close));
    if (closeBtn.evaluate().isNotEmpty) {
      await tester.tap(closeBtn.first);
      for (var i = 0; i < 30; i++) {
        await tester.pump(const Duration(milliseconds: 1000 ~/ 30));
      }
    }
    const landAt = 24; // frames of steady state before the expense lands
    var idx = 0;
    for (; idx < landAt; idx++) {
      await tester.pump(const Duration(milliseconds: 1000 ~/ 30));
      await shot(tester, key, 'home', idx);
    }
    expenses.add(Expense(
      id: 'new',
      expenseName: 'Starbucks',
      amount: 6.85,
      category: 'Coffee',
      description: 'Captured from payment notification',
      date: _at(8, 9, 41),
      createdAt: _at(8, 9, 41),
      source: 'smsAutoDetected',
    ));
    for (; idx < 100; idx++) {
      await tester.pump(const Duration(milliseconds: 1000 ~/ 30));
      await shot(tester, key, 'home', idx);
    }
    final row = find.ancestor(
        of: find.text('Starbucks'), matching: find.byType(InkWell));
    final rect = row.evaluate().isEmpty ? null : tester.getRect(row.first);
    File('$kOut/home_rects.json').writeAsStringSync(jsonEncode({
      'landAt': landAt,
      'starbucks': rect == null
          ? null
          : [rect.left, rect.top, rect.width, rect.height],
    }));
    final ex = tester.takeException();
    // ignore: avoid_print
    if (ex != null) print('EXCEPTION: $ex');
    await finish(tester);
  });
}

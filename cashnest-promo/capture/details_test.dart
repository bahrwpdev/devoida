import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:cashnest/models/expense.dart';
import 'package:cashnest/providers/budget_cycle_provider.dart';
import 'package:cashnest/providers/budget_provider.dart';
import 'package:cashnest/providers/currency_provider.dart';
import 'package:cashnest/providers/expense_provider.dart';
import 'package:cashnest/providers/profile_provider.dart';
import 'package:cashnest/providers/split_provider.dart';
import 'package:cashnest/screens/expense_details_screen.dart';

import 'fakes.dart';
import 'harness.dart';

void main() {
  testWidgets('expense details', (tester) async {
    await loadFonts();
    final expense = Expense(
      id: 'e1',
      expenseName: 'Starbucks',
      amount: 6.85,
      category: 'Coffee',
      description: 'Captured from payment notification',
      date: DateTime(2026, 11, 8, 9, 41),
      createdAt: DateTime(2026, 11, 8, 9, 41),
      latitude: 40.7,
      longitude: -74.0,
      locationName: 'Starbucks, 5th Avenue',
      source: 'smsAutoDetected',
    );
    final key = await pumpScreen(
      tester,
      ExpenseDetailsScreen(expense: expense, heroTag: 'x'),
      providers: [
        ChangeNotifierProvider<CurrencyProvider>.value(value: FakeCurrency()),
        ChangeNotifierProvider<ExpenseProvider>.value(value: FakeExpenses()),
        ChangeNotifierProvider<BudgetProvider>.value(value: FakeBudgets()),
        ChangeNotifierProvider<BudgetCycleProvider>.value(value: FakeCycles()),
        ChangeNotifierProvider<SplitProvider>.value(value: FakeSplits()),
        ChangeNotifierProvider<ProfileProvider>.value(value: FakeProfile()),
      ],
    );
    final ex = tester.takeException();
    // ignore: avoid_print
    print('EXCEPTION: $ex');
    await record(tester, key, 'details', frames: 75);
    await finish(tester);
  });
}

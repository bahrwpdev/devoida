import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:cashnest/providers/budget_cycle_provider.dart';
import 'package:cashnest/providers/budget_provider.dart';
import 'package:cashnest/providers/currency_provider.dart';
import 'package:cashnest/providers/expense_provider.dart';
import 'package:cashnest/providers/profile_provider.dart';
import 'package:cashnest/providers/split_provider.dart';
import 'package:cashnest/providers/subscription_provider.dart';
import 'package:cashnest/providers/user_provider.dart';
import 'package:cashnest/screens/new_split_screen.dart';

import 'fakes.dart';
import 'flows.dart';
import 'harness.dart';

void main() {
  testWidgets('split flow (dev)', (tester) async {
    await loadFonts();
    mockLauncher();
    SharedPreferences.setMockInitialValues({});
    await tester.runAsync(() async {
      await Supabase.initialize(url: 'https://example.supabase.co', anonKey: 'anon');
    });
    final key = await pumpScreen(
      tester,
      const NewSplitScreen(),
      providers: [
        ChangeNotifierProvider<CurrencyProvider>.value(value: FakeCurrency()),
        ChangeNotifierProvider<ProfileProvider>.value(value: FakeProfile()),
        ChangeNotifierProvider<SubscriptionProvider>.value(value: FakeSubscription()),
        ChangeNotifierProvider<UserProvider>.value(value: FakeUser()),
        ChangeNotifierProvider<SplitProvider>.value(value: FakeSplits()),
        ChangeNotifierProvider<ExpenseProvider>.value(value: FakeExpenses()),
        ChangeNotifierProvider<BudgetProvider>.value(value: FakeBudgets()),
        ChangeNotifierProvider<BudgetCycleProvider>.value(value: FakeCycles()),
      ],
    );
    final r = Rec(tester, key, 'splitFlow');
    await splitFlow(tester, r, pace: 1);
    r.save();
    await finish(tester);
  });
}

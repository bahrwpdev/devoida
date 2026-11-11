import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';
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
import 'package:cashnest/screens/new_split_screen.dart';
import 'package:cashnest/screens/recurring_bills_screen.dart';
import 'package:cashnest/services/recurring_bill_service.dart' show captureHistory, BillPaymentHistory;
import 'package:cashnest/utils/notification_utils.dart';
import 'package:cashnest/screens/split_bill_screen.dart';
import 'package:cashnest/utils/amount_input_formatter.dart';
import 'package:cashnest/widgets/custom_navigation_bar.dart';
import 'package:cashnest/widgets/ui/bubble_fab.dart';

import 'fakes.dart';
import 'bills_data.dart';
import 'flows.dart';
import 'harness.dart';

/// Dates are relative to today, so the video is always "Today" and "Yesterday".
DateTime _at(int daysAgo, int h, int m) {
  final n = DateTime.now();
  return DateTime(n.year, n.month, n.day - daysAgo, h, m);
}

Expense _e(String id, String name, double amt, String cat, DateTime at) =>
    Expense(
        id: id,
        expenseName: name,
        amount: amt,
        category: cat,
        description: '',
        date: at,
        createdAt: at);

app_split.Split _split(String id, String name, double total, List<String> who,
        DateTime at) =>
    app_split.Split(
      id: id,
      billName: name,
      totalAmount: total,
      sharedCosts: 0,
      paidAmount: total,
      participants: who,
      participantAmounts: const {},
      isCustomSplit: false,
      addToExpenses: false,
      date: at,
      createdAt: at,
    );

/// The tab shell: the real nav bar around the real tab screens.
class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => ShellState();
}

class ShellState extends State<Shell> {
  int index = 0;
  void go(int i) => setState(() => index = i);
  @override
  Widget build(BuildContext context) {
    final Widget body = switch (index) {
      0 => const HomeDashboard(),
      1 => const SplitBillScreen(),
      _ => const RecurringBillsScreen(isTab: true),
    };
    return Scaffold(
      backgroundColor: AppTheme.pageBackground,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: KeyedSubtree(key: ValueKey(index), child: body),
      ),
      bottomNavigationBar: CustomNavigationBar(currentIndex: index, onTap: go),
    );
  }
}

void main() {
  testWidgets('tour: home, detection, details, splits, bills', (tester) async {
    await loadFonts();
    mockLauncher();
    SharedPreferences.setMockInitialValues({});
    await tester.runAsync(() async {
      await Supabase.initialize(url: 'https://example.supabase.co', anonKey: 'anon');
    });
    final n = DateTime.now();
    captureHistory = [
      for (final m in [1, 2, 3])
        BillPaymentHistory(
          id: 'p$m',
          billId: 'b1',
          userId: 'u1',
          paymentDate: DateTime(n.year, n.month - m, 12),
          estimatedAmount: 15.49,
          actualAmount: 15.49,
          paymentStatus: 'full',
          createdAt: DateTime(n.year, n.month - m, 12),
        ),
    ];
    final expenses = FakeExpenses()
      ..list = [
        _e('1', 'Uber', 14.20, 'Transport', _at(0, 8, 12)),
        _e('2', 'Whole Foods', 63.40, 'Groceries', _at(1, 18, 30)),
        _e('3', 'Netflix', 15.49, 'Entertainment', _at(2, 12, 0)),
        _e('4', 'Shell', 42.00, 'Transport', _at(3, 17, 10)),
        _e('5', 'Blue Bottle', 5.50, 'Coffee', _at(3, 9, 2)),
        _e('6', 'Zara', 143.00, 'Shopping', _at(6, 15, 0)),
        _e('7', 'Electricity bill', 128.71, 'Bills & Utilities', _at(7, 10, 0)),
      ];
    final splits = FakeSplits()
      ..list = [
        _split('s1', 'Weekend trip', 412, ['Rashad', 'Sarah', 'Mike', 'Lina'], _at(3, 20, 0)),
        _split('s2', 'Groceries', 86.30, ['Rashad', 'Sarah', 'Mike'], _at(8, 19, 0)),
        _split('s3', 'Movie night', 54, ['Rashad', 'Lina'], _at(5, 21, 0)),
      ];
    final bills = FakeBills()..list = demoBills();
    final List<SingleChildWidget> providers = [
      ChangeNotifierProvider<CurrencyProvider>.value(value: FakeCurrency()),
      ChangeNotifierProvider<ExpenseProvider>.value(value: expenses),
      ChangeNotifierProvider<SplitProvider>.value(value: splits),
      ChangeNotifierProvider<BudgetProvider>.value(value: FakeBudgets()),
      ChangeNotifierProvider<BudgetCycleProvider>.value(value: FakeCycles()),
      ChangeNotifierProvider<MonthlyBudgetProvider>.value(value: FakeMonthly(2000)),
      ChangeNotifierProvider<GoalProvider>.value(value: FakeGoals()),
      ChangeNotifierProvider<AssetProvider>.value(value: FakeAssets()),
      ChangeNotifierProvider<RecurringBillProvider>.value(value: bills),
      ChangeNotifierProvider<SubscriptionProvider>.value(value: FakeSubscription()),
      ChangeNotifierProvider<UserProvider>.value(value: FakeUser()),
      ChangeNotifierProvider<ProfileProvider>.value(value: FakeProfile()),
      ChangeNotifierProvider<SmsDetectionProvider>.value(value: FakeSms()),
      ChangeNotifierProvider<NotificationProvider>.value(value: FakeNotifications()),
      ChangeNotifierProvider<InsightsProvider>.value(value: FakeInsights()),
      ChangeNotifierProvider<LeftoverProvider>.value(value: FakeLeftover()),
    ];
    final key = await pumpScreen(tester, const Shell(), providers: providers);
    final r = Rec(tester, key, 'tour');

    // settle the home reveal off-camera so it starts right as we record
    for (var i = 0; i < sec(1.7); i++) {
      await tester.pump(const Duration(microseconds: 16667));
    }
    BuildContext ctx() => tester.element(find.byType(Shell));

    // 1. Home, then the app detects a payment
    r.mark('start');
    await r.frames(sec(4.6));
    r.mark('popupDetected');
    NotificationUtils.showInfoNotification(ctx(),
        title: 'Payment detected', message: 'USD 6.85 at Starbucks', duration: const Duration(milliseconds: 1500));
    await r.frames(sec(1.7));
    r.mark('popupSaved');
    NotificationUtils.showSuccessNotification(ctx(),
        title: 'Payment saved',
        message: 'Payment of USD 6.85 at Starbucks got saved.',
        duration: const Duration(milliseconds: 1800));
    await r.frames(sec(0.4));
    r.mark('expenseLands');
    expenses.add(Expense(
      id: 'new',
      expenseName: 'Starbucks',
      amount: 6.85,
      category: 'Coffee',
      description: 'Captured from payment notification',
      date: _at(0, 9, 41),
      createdAt: _at(0, 9, 41),
      latitude: 40.7411,
      longitude: -73.9897,
      locationName: 'Starbucks, 5th Avenue',
      source: 'smsAutoDetected',
    ));
    await r.frames(sec(2.6));

    // 2. open the new expense: details with the location
    await r.tap('tapRow', find.text('Starbucks'));
    await r.frames(sec(0.9));
    r.settled('expenseDetails', bottom: 844);
    await r.frames(sec(3.2));
    await r.tap('tapBack', find.byIcon(Icons.arrow_back));
    await r.frames(sec(0.7));
    r.mark('backDone');

    // 3. Splits: the list, then a new split end to end
    await r.tapAt('tapSplitsNav', const Offset(240, 797));
    await r.frames(sec(0.7));
    r.settled('splitsList');
    await r.frames(sec(0.8));
    await r.tap('tapFab', find.byType(BubbleFab));
    await r.frames(sec(0.8));
    r.settled('newSplit', bottom: 756);
    await r.frames(sec(0.35));
    await splitFlow(tester, r);
    await r.frames(sec(1.0)); // back on the Splits list, the new split on top

    // 4. Bills: the list, then one bill
    await r.tapAt('tapBillsNav', const Offset(292, 797));
    await r.frames(sec(0.7));
    r.settled('billsList');
    await r.frames(sec(0.5));
    await r.tap('tapBill', find.text('Netflix'));
    await r.frames(sec(0.9));
    r.settled('billDetail', bottom: 844);
    await r.frames(sec(3.6));
    r.mark('end');
    r.save();
    await finish(tester);
  });
}

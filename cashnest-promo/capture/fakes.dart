import 'package:flutter/material.dart';

import 'package:cashnest/models/budget.dart';
import 'package:cashnest/models/profile_model.dart';
import 'package:cashnest/models/user_model.dart';
import 'package:cashnest/models/expense.dart';
import 'package:cashnest/models/recurring_bill.dart';
import 'package:cashnest/models/split.dart' as app_split;
import 'package:cashnest/providers/asset_provider.dart';
import 'package:cashnest/providers/budget_cycle_provider.dart';
import 'package:cashnest/providers/budget_provider.dart';
import 'package:cashnest/providers/currency_provider.dart';
import 'package:cashnest/providers/expense_provider.dart';
import 'package:cashnest/providers/goal_provider.dart';
import 'package:cashnest/providers/leftover_provider.dart';
import 'package:cashnest/utils/leftover_offer.dart';
import 'package:cashnest/providers/insights_provider.dart';
import 'package:cashnest/providers/monthly_budget_provider.dart';
import 'package:cashnest/providers/notification_provider.dart';
import 'package:cashnest/providers/profile_provider.dart';
import 'package:cashnest/providers/recurring_bill_provider.dart';
import 'package:cashnest/providers/sms_detection_provider.dart';
import 'package:cashnest/providers/split_provider.dart';
import 'package:cashnest/providers/subscription_provider.dart';
import 'package:cashnest/providers/user_provider.dart';
import 'package:cashnest/models/notification_item.dart';
import 'package:cashnest/models/goal.dart';
import 'package:cashnest/models/asset.dart';
import 'package:cashnest/services/insights_service.dart';
import 'package:cashnest/services/subscription_service.dart';

import 'harness.dart';

class FakeExpenses extends ChangeNotifier implements ExpenseProvider {
  List<Expense> list = [];
  void add(Expense e) {
    list = [e, ...list];
    notifyListeners();
  }

  @override
  List<Expense> get expenses => list;
  @override
  List<Expense> expensesForMonth(int year, int month) => list
      .where((e) => e.date.year == year && e.date.month == month)
      .toList();
  @override
  Future<void> ensureMonthComplete(int year, int month) async {}
  @override
  Future<void> reloadForCurrentUser() async {}
  @override
  String? get errorMessage => null;
  @override
  bool get isOwnedByCurrentUser => true;
  @override
  Map<String, Map<String, dynamic>> get splitExpenses => {};
  @override
  bool isSplitExpense(String id) => false;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeSplits extends ChangeNotifier implements SplitProvider {
  List<app_split.Split> list = [];
  @override
  List<app_split.Split> get splits => list;
  @override
  bool get hasFreshData => true;
  @override
  bool get hasLocalDataLoaded => true;
  @override
  bool get isLoading => false;
  @override
  bool get hasError => false;
  @override
  String? get errorMessage => null;
  @override
  Future<void> reloadForCurrentUser() async {}
  @override
  Future<void> reloadSplits() async {}
  @override
  Future<app_split.Split> addSplit(app_split.Split split,
      {ExpenseProvider? expenseProvider,
      BudgetProvider? budgetProvider,
      BudgetCycleProvider? budgetCycleProvider,
      Map<String, String>? phoneNumbers}) async {
    list = [split, ...list];
    notifyListeners();
    return split;
  }
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeBudgets extends ChangeNotifier implements BudgetProvider {
  @override
  List<Budget> get budgets => [];
  @override
  bool get hasFreshData => true;
  @override
  Future<void> reloadForCurrentUser() async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeCycles extends ChangeNotifier implements BudgetCycleProvider {
  @override
  List<Budget> get budgets => [];
  @override
  bool get hasFreshData => true;
  @override
  bool get hasLocalDataLoaded => true;
  @override
  bool get isLoading => false;
  @override
  String? get error => null;
  @override
  Future<void> reloadForCurrentUser() async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeMonthly extends ChangeNotifier implements MonthlyBudgetProvider {
  double? budget;
  FakeMonthly(this.budget);
  @override
  double? allowanceFor(DateTime month) => budget;
  @override
  bool get isLoading => false;
  @override
  bool get hasLoadedOnce => true;
  @override
  String? get error => null;
  @override
  Future<void> load() async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeGoals extends ChangeNotifier implements GoalProvider {
  @override
  List<Goal> get goals => [];
  @override
  List<Goal> get activeGoals => [];
  @override
  List<Goal> get completedGoals => [];
  @override
  bool get isLoading => false;
  @override
  bool get hasError => false;
  @override
  Future<void> reloadForCurrentUser() async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeAssets extends ChangeNotifier implements AssetProvider {
  @override
  List<Asset> get assets => [];
  @override
  bool get isLoading => false;
  @override
  bool get hasError => false;
  @override
  Future<void> reloadForCurrentUser() async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeBills extends ChangeNotifier implements RecurringBillProvider {
  @override
  List<RecurringBill> get homeAttentionBills => [];
  @override
  List<RecurringBill> get overdueBills => [];
  @override
  List<RecurringBill> get dueSoonBills => [];
  @override
  List<RecurringBill> get dueThisWeekBills => [];
  @override
  List<RecurringBill> get activeBills => [];
  @override
  Future<void> loadBills() async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeSubscription extends ChangeNotifier implements SubscriptionProvider {
  @override
  Future<void> loadSubscription({bool skipAutoTrialCreation = false}) async {}
  @override
  bool get isInitialized => true;
  @override
  bool get isLoading => false;
  @override
  bool get isPremium => true;
  @override
  bool get isPremiumSubscriber => true;
  @override
  SubscriptionStatus get status => SubscriptionStatus.active;
  @override
  bool get isTrialActive => false;
  @override
  bool get isFree => false;
  @override
  int? get trialDaysRemaining => null;
  @override
  bool canCreateGoal(int c) => true;
  @override
  bool canCreateAsset(int c) => true;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeUser extends ChangeNotifier implements UserProvider {
  @override
  Future<void> loadAccountPhone() async {}
  @override
  Future<String> ensureAccountPhone() async => '+15551230100';
  @override
  bool get isAccountSwitchCleanupPending => false;
  @override
  bool get isInitialized => true;
  @override
  User? get currentUser => null;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeProfile extends ChangeNotifier implements ProfileProvider {
  @override
  String get name => 'Rashad';
  @override
  String get username => 'rashad';
  @override
  int? get userId => 1;
  @override
  String? get profilePicture => null;
  @override
  bool get isLoading => false;
  @override
  Profile? get currentProfile => null;
  @override
  Future<void> loadProfile(String username) async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeSms extends ChangeNotifier implements SmsDetectionProvider {
  @override
  bool get isEnabled => true;
  @override
  bool isActiveOn({required bool isIOS}) => false;
  @override
  void recordUsageIfActive({required bool isIOS}) {}
  @override
  int get freeUsesCount => 0;
  @override
  bool get hadDetectionBefore => false;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeNotifications extends ChangeNotifier implements NotificationProvider {
  @override
  List<NotificationItem> get notifications => [];
  @override
  int get unreadCount => 0;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeInsights extends ChangeNotifier implements InsightsProvider {
  @override
  List<DynamicInsight> get topInsights => [];
  @override
  bool get needsUpdate => false;
  @override
  bool get isLoading => false;
  @override
  Future<void> updateInsights({
    required List<Expense> expenses,
    required double totalSpending,
    required BudgetProvider budgetProvider,
    required GoalProvider goalProvider,
    required AssetProvider assetProvider,
    required SplitProvider splitProvider,
    required ProfileProvider profileProvider,
  }) async {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeLeftover extends ChangeNotifier implements LeftoverProvider {
  @override
  LeftoverOffer? get offer => null;
  @override
  bool get hasDroppedCarryMessage => false;
  @override
  bool get showDone => false;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

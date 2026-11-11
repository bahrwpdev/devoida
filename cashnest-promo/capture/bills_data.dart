import 'package:cashnest/models/recurring_bill.dart';

/// Demo bills, due dates relative to today.
List<RecurringBill> demoBills() {
  final n = DateTime.now();
  DateTime inDays(int d) => DateTime(n.year, n.month, n.day + d);
  RecurringBill b(String id, String name, double amt, String cat, int due, int remind,
          {bool variable = false, DateTime? lastPaid}) =>
      RecurringBill(
        id: id,
        userId: 'u1',
        name: name,
        estimatedAmount: amt,
        currency: 'USD',
        recurrence: 'monthly',
        dueDay: inDays(due).day,
        category: cat,
        status: 'active',
        reminderDaysBefore: remind,
        isVariableAmount: variable,
        lastPaidDate: lastPaid ?? inDays(due - 30),
        nextDueDate: inDays(due),
        createdAt: inDays(-90),
        updatedAt: inDays(-1),
      );
  return [
    b('b1', 'Netflix', 15.49, 'Entertainment', 2, 2),
    b('b2', 'Gym membership', 29.99, 'Health', 4, 3),
    b('b3', 'Electricity', 128.71, 'Bills & Utilities', 9, 3, variable: true),
    b('b4', 'Rent', 1200.00, 'Housing', 20, 5),
    b('b5', 'Spotify', 10.99, 'Entertainment', 13, 1),
    b('b6', 'Phone plan', 45.00, 'Bills & Utilities', 16, 2),
  ];
}

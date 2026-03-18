from apps.gastos.models import Expense, ExpenseCategory


def soft_delete_expense_category(category: ExpenseCategory) -> ExpenseCategory:
    category.soft_delete()
    return category


def soft_delete_expense(expense: Expense) -> Expense:
    expense.soft_delete()
    return expense

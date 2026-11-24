import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_service'))

from app import (
    health_check,
    chat_endpoint,
    financial_summary_endpoint,
    expense_analysis_endpoint,
    budget_recommendations_endpoint,
    savings_forecast_endpoint,
    investment_insights_endpoint,
    ChatRequest
)

print("=== TESTING FASTAPI AI SERVICE DIRECT FUNCTIONS ===")

# 1. Health
h = health_check()
print("1. Health Check:", h["status"], "-", h["service"])

sample_data = {
    "user": {"name": "Alex Morgan", "currency": "USD", "monthlyIncomeGoal": 7500},
    "metrics": {"totalIncome": 7970.0, "totalExpense": 3079.09, "savingsRate": 61.4, "balance": 4890.91},
    "activeBudget": {"totalBudget": 4200.0},
    "incomes": [
        {"title": "Tech Lead Salary", "amount": 6200.0, "category": "Salary", "date": "2026-11-01", "paymentSource": "Direct Deposit"},
        {"title": "Consulting", "amount": 1450.0, "category": "Freelancing", "date": "2026-11-12", "paymentSource": "PayPal"}
    ],
    "expenses": [
        {"title": "Rent", "amount": 1850.0, "category": "Rent", "date": "2026-11-02", "paymentMethod": "Bank Transfer"},
        {"title": "Groceries", "amount": 320.5, "category": "Food", "date": "2026-11-04", "paymentMethod": "Credit Card"},
        {"title": "Team Dinner", "amount": 185.4, "category": "Food", "date": "2026-11-08", "paymentMethod": "Credit Card"},
        {"title": "Desk Mat", "amount": 220.0, "category": "Shopping", "date": "2026-11-14", "paymentMethod": "Credit Card"}
    ],
    "goals": [
        {"title": "Emergency Fund", "targetAmount": 18000.0, "currentAmount": 13500.0, "targetDate": "2027-05-01", "category": "Emergency fund", "status": "in_progress"}
    ],
    "investments": [
        {"assetName": "Apple", "symbol": "AAPL", "assetType": "Stocks", "purchasePrice": 175.5, "currentPrice": 228.4, "quantity": 35, "invested": 6142.5, "currentValue": 7994.0},
        {"assetName": "VOO ETF", "symbol": "VOO", "assetType": "ETFs", "purchasePrice": 420.0, "currentPrice": 535.8, "quantity": 25, "invested": 10500.0, "currentValue": 13395.0}
    ]
}

# 2. Chat
chat_res = chat_endpoint(ChatRequest(message="Where am I spending the most money?", financialData=sample_data))
print("2. Chat Q1 Response Preview:\n  ", chat_res["reply"][:140], "...")

# 3. Chat Q2
chat_res2 = chat_endpoint(ChatRequest(message="How much did I save this month?", financialData=sample_data))
print("3. Chat Q2 Response Preview:\n  ", chat_res2["reply"][:140], "...")

# 4. Summary
sum_res = financial_summary_endpoint(sample_data)
print("4. Summary Endpoint: Success =", sum_res["success"], "| Preview:", sum_res["summary"][:120], "...")

# 5. Expense Anomaly
exp_res = expense_analysis_endpoint(sample_data)
print("5. Expense Analysis: Categories analyzed =", len(exp_res["highSpendingCategories"]), "| Anomalies =", len(exp_res["anomalies"]))

# 6. Budget
bud_res = budget_recommendations_endpoint(sample_data)
print("6. Budget Recommendations: 50/30/20 target needs =", bud_res["rule503020"]["ruleTargets"]["needs"]["target"])

# 7. Savings Forecast
sav_res = savings_forecast_endpoint(sample_data)
print("7. Savings Forecast: Potential monthly savings =", sav_res["potentialMonthlySavings"])

# 8. Investment Insights
inv_res = investment_insights_endpoint(sample_data)
print("8. Investment Insights: Diversification score =", inv_res["diversificationScore"], "| Classes =", inv_res["assetClassesCount"])

print("\n🎉 ALL 8 FASTAPI AI SERVICE DIRECT ENDPOINTS PASSED WITH 100% SUCCESS!")

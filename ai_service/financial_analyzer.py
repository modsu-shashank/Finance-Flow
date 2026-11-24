import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

try:
    from sklearn.ensemble import IsolationForest
    HAS_SKLEARN = True
except (ImportError, PermissionError, Exception):
    HAS_SKLEARN = False


class FinancialAnalyzer:
    """
    Advanced financial data analysis engine utilizing Pandas, NumPy, and Scikit-learn
    to provide data-driven insights, anomaly detection, and budget modeling.
    """

    def __init__(self, financial_data: Dict[str, Any]):
        self.data = financial_data
        self.metrics = financial_data.get("metrics", {})
        self.raw_incomes = financial_data.get("incomes", [])
        self.raw_expenses = financial_data.get("expenses", [])
        self.goals = financial_data.get("goals", [])
        self.investments = financial_data.get("investments", [])
        self.active_budget = financial_data.get("activeBudget") or {}

        # Convert to Pandas DataFrames
        self.df_incomes = pd.DataFrame(self.raw_incomes) if self.raw_incomes else pd.DataFrame(columns=["title", "amount", "category", "date", "paymentSource"])
        self.df_expenses = pd.DataFrame(self.raw_expenses) if self.raw_expenses else pd.DataFrame(columns=["title", "amount", "category", "date", "paymentMethod"])

        if not self.df_incomes.empty and "date" in self.df_incomes.columns:
            self.df_incomes["date"] = pd.to_datetime(self.df_incomes["date"])
            self.df_incomes["amount"] = pd.to_numeric(self.df_incomes["amount"], errors="coerce").fillna(0)

        if not self.df_expenses.empty and "date" in self.df_expenses.columns:
            self.df_expenses["date"] = pd.to_datetime(self.df_expenses["date"])
            self.df_expenses["amount"] = pd.to_numeric(self.df_expenses["amount"], errors="coerce").fillna(0)

    def get_category_spending(self) -> List[Dict[str, Any]]:
        """Compute aggregated spending and distribution per category using Pandas."""
        if self.df_expenses.empty:
            return []

        grouped = self.df_expenses.groupby("category")["amount"].agg(["sum", "count"]).reset_index()
        total_spent = grouped["sum"].sum()

        grouped["percentage"] = (grouped["sum"] / (total_spent if total_spent > 0 else 1) * 100).round(1)
        grouped = grouped.sort_values(by="sum", ascending=False)

        results = []
        for _, row in grouped.iterrows():
            results.append({
                "category": row["category"],
                "amount": float(round(row["sum"], 2)),
                "count": int(row["count"]),
                "percentage": float(row["percentage"])
            })
        return results

    def detect_expense_anomalies(self) -> List[Dict[str, Any]]:
        """
        Detect unusual spending transactions using Machine Learning (IsolationForest)
        or statistical Z-score outlier detection.
        """
        if self.df_expenses.empty or len(self.df_expenses) < 4:
            return []

        anomalies = []
        amounts = self.df_expenses["amount"].values.reshape(-1, 1)

        # Machine Learning Anomaly Detection via Isolation Forest
        if HAS_SKLEARN and len(amounts) >= 6:
            try:
                clf = IsolationForest(contamination=0.15, random_state=42)
                predictions = clf.fit_predict(amounts)
                # -1 indicates anomaly in IsolationForest
                anomaly_indices = np.where(predictions == -1)[0]

                mean_val = np.mean(amounts)
                for idx in anomaly_indices:
                    row = self.df_expenses.iloc[idx]
                    if row["amount"] > mean_val:  # We are primarily interested in unusually high expenses
                        anomalies.append({
                            "title": str(row["title"]),
                            "amount": float(row["amount"]),
                            "category": str(row["category"]),
                            "date": row["date"].strftime("%Y-%m-%d") if hasattr(row["date"], "strftime") else str(row["date"]),
                            "method": "IsolationForest ML Detection",
                            "reason": f"Unusually high expense ({(row['amount']/mean_val):.1f}x higher than average transaction of ${mean_val:.2f})"
                        })
            except Exception:
                pass

        # Fallback / augment with Z-score outlier detection
        if not anomalies and len(amounts) >= 4:
            mean = np.mean(amounts)
            std = np.std(amounts)
            if std > 0:
                for _, row in self.df_expenses.iterrows():
                    z = (row["amount"] - mean) / std
                    if z > 1.8:
                        anomalies.append({
                            "title": str(row["title"]),
                            "amount": float(row["amount"]),
                            "category": str(row["category"]),
                            "date": row["date"].strftime("%Y-%m-%d") if hasattr(row["date"], "strftime") else str(row["date"]),
                            "method": "Z-Score Statistical Detection",
                            "reason": f"Statistically elevated expenditure ({z:.1f} standard deviations above mean)"
                        })

        return sorted(anomalies, key=lambda x: x["amount"], reverse=True)[:5]

    def compare_month_over_month(self) -> Dict[str, Any]:
        """Compare current month spending with previous month spending."""
        if self.df_expenses.empty:
            return {
                "currentMonthSpent": 0,
                "prevMonthSpent": 0,
                "difference": 0,
                "percentChange": 0,
                "direction": "flat"
            }

        now = datetime.now()
        cur_month_start = datetime(now.year, now.month, 1)
        prev_month_end = cur_month_start - timedelta(days=1)
        prev_month_start = datetime(prev_month_end.year, prev_month_end.month, 1)

        cur_mask = (self.df_expenses["date"] >= cur_month_start)
        prev_mask = (self.df_expenses["date"] >= prev_month_start) & (self.df_expenses["date"] <= prev_month_end)

        cur_spent = float(self.df_expenses[cur_mask]["amount"].sum())
        prev_spent = float(self.df_expenses[prev_mask]["amount"].sum())

        diff = round(cur_spent - prev_spent, 2)
        pct = round(((diff / prev_spent) * 100), 1) if prev_spent > 0 else 0

        direction = "increased" if diff > 0 else ("decreased" if diff < 0 else "unchanged")

        return {
            "currentMonthSpent": round(cur_spent, 2),
            "prevMonthSpent": round(prev_spent, 2),
            "difference": abs(diff),
            "percentChange": abs(pct),
            "direction": direction,
            "rawDiff": diff
        }

    def calculate_50_30_20_allocation(self) -> Dict[str, Any]:
        """Apply popular 50/30/20 wealth building rule based on user income."""
        total_income = float(self.metrics.get("totalIncome", 0))
        if total_income <= 0 and not self.df_incomes.empty:
            total_income = float(self.df_incomes["amount"].sum())

        target_needs = round(total_income * 0.50, 2)
        target_wants = round(total_income * 0.30, 2)
        target_savings = round(total_income * 0.20, 2)

        # Categorize known expenses into needs vs wants
        needs_categories = {"Rent", "Bills", "Healthcare", "Food", "Transportation"}
        wants_categories = {"Shopping", "Entertainment", "Travel", "Others"}

        actual_needs = 0
        actual_wants = 0

        if not self.df_expenses.empty:
            for _, row in self.df_expenses.iterrows():
                cat = row["category"]
                amt = row["amount"]
                if cat in needs_categories:
                    actual_needs += amt
                else:
                    actual_wants += amt

        actual_savings = max(0, total_income - (actual_needs + actual_wants))

        return {
            "income": total_income,
            "ruleTargets": {
                "needs": {"target": target_needs, "percent": 50},
                "wants": {"target": target_wants, "percent": 30},
                "savings": {"target": target_savings, "percent": 20}
            },
            "actualAllocation": {
                "needs": {"amount": round(actual_needs, 2), "percent": round((actual_needs / (total_income or 1)) * 100, 1)},
                "wants": {"amount": round(actual_wants, 2), "percent": round((actual_wants / (total_income or 1)) * 100, 1)},
                "savings": {"amount": round(actual_savings, 2), "percent": round((actual_savings / (total_income or 1)) * 100, 1)}
            }
        }

    def evaluate_portfolio_diversification(self) -> Dict[str, Any]:
        """Evaluate investment diversification across asset classes."""
        if not self.investments:
            return {
                "score": "N/A",
                "assetTypes": [],
                "insight": "No investment holdings tracked yet. Adding diversified assets will build long-term wealth."
            }

        asset_map = {}
        total_val = 0
        for inv in self.investments:
            atype = inv.get("assetType", "Other")
            val = float(inv.get("currentValue", inv.get("invested", 0)))
            asset_map[atype] = asset_map.get(atype, 0) + val
            total_val += val

        allocations = []
        herfindahl_index = 0
        for atype, val in asset_map.items():
            pct = round((val / (total_val if total_val > 0 else 1)) * 100, 1)
            allocations.append({"assetType": atype, "value": round(val, 2), "percent": pct})
            share = pct / 100
            herfindahl_index += share ** 2

        # A lower Herfindahl index means higher diversification
        if len(asset_map) >= 4 and herfindahl_index < 0.35:
            score = "Excellent"
            insight = "Your portfolio shows balanced diversification across equities, ETFs, commodities, and fixed income."
        elif len(asset_map) >= 2 and herfindahl_index < 0.60:
            score = "Moderate"
            insight = "Good foundation. Consider expanding into uncorrelated asset types like index funds or debt instruments."
        else:
            score = "Concentrated"
            insight = "Your holdings are concentrated in few asset classes. Diversification helps reduce volatility risk."

        return {
            "score": score,
            "totalPortfolioValue": round(total_val, 2),
            "assetClassesCount": len(asset_map),
            "allocations": allocations,
            "insight": insight
        }

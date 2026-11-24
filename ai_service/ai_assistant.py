from typing import Dict, Any, List
import re
from financial_analyzer import FinancialAnalyzer


class AIAssistant:
    """
    Intelligent conversational financial advisor that analyzes user's data
    and generates natural-language explanations, recommendations, and answers.
    """

    def __init__(self, financial_data: Dict[str, Any]):
        self.data = financial_data
        self.analyzer = FinancialAnalyzer(financial_data)
        self.user_info = financial_data.get("user", {})
        self.user_name = self.user_info.get("name", "there")
        self.currency = self.user_info.get("currency", "USD")
        self.symbol = "$" if self.currency == "USD" else (self.currency + " ")

    def answer_query(self, user_message: str) -> Dict[str, Any]:
        """Classify user intent and formulate a comprehensive, data-backed answer."""
        msg = user_message.lower().strip()

        # 1. Biggest spending / where am I spending most
        if any(p in msg for p in ["where am i spending", "most money", "biggest spending", "top spending", "highest expense", "spend the most"]):
            return self._handle_biggest_spending()

        # 2. Savings inquiries
        elif any(p in msg for p in ["how much did i save", "saved this month", "savings rate", "how much savings", "my savings"]):
            return self._handle_savings_inquiry()

        # 3. Reduce expenses / cut costs
        elif any(p in msg for p in ["reduce", "cut", "lower", "save money on expenses", "trim expenses"]):
            return self._handle_reduce_expenses()

        # 4. Budget adherence
        elif any(p in msg for p in ["following my budget", "budget status", "am i over budget", "budget limit", "track budget", "my budget"]):
            return self._handle_budget_status()

        # 5. Goal planning
        elif any(p in msg for p in ["achieve my goal", "save for my goal", "how much should i save monthly", "reach my goal", "financial goal"]):
            return self._handle_goal_planning()

        # 6. Compare this month with last month
        elif any(p in msg for p in ["compare", "month with last month", "spending this month vs", "vs last month"]):
            return self._handle_month_comparison()

        # 7. Overall financial summary
        elif any(p in msg for p in ["summarize", "summary", "overview", "financial activities", "how am i doing", "financial health"]):
            return self._handle_financial_summary()

        # 8. Investment portfolio inquiries
        elif any(p in msg for p in ["invest", "portfolio", "stocks", "etf", "diversification", "crypto", "return"]):
            return self._handle_investment_inquiry()

        # 9. Generic / conversational greetings
        else:
            return self._handle_general_query(user_message)

    def _handle_biggest_spending(self) -> Dict[str, Any]:
        categories = self.analyzer.get_category_spending()
        if not categories:
            return {
                "reply": "You haven't recorded any expenses yet! Once you log a few expenses, I will analyze your largest spending categories.",
                "suggestions": ["How do I set a budget?", "Add my first expense"]
            }

        top = categories[0]
        second = categories[1] if len(categories) > 1 else None

        text = (
            f"Your largest spending category is **{top['category']}**, where you've spent "
            f"**{self.symbol}{top['amount']:,.2f}** ({top['percentage']}% of your total expenses over {top['count']} transaction(s)).\n\n"
        )

        if second:
            text += (
                f"Your second highest category is **{second['category']}** at "
                f"**{self.symbol}{second['amount']:,.2f}** ({second['percentage']}%).\n\n"
            )

        text += "💡 **Optimization Tip**: Check if any recurring bills or discretionary purchases in these categories can be reduced or negotiated."

        return {
            "reply": text,
            "data": {"topCategories": categories[:3]},
            "suggestions": [
                "Can I reduce my monthly expenses?",
                "Am I following my budget?",
                "How much did I save this month?"
            ]
        }

    def _handle_savings_inquiry(self) -> Dict[str, Any]:
        metrics = self.data.get("metrics", {})
        income = float(metrics.get("totalIncome", 0))
        expense = float(metrics.get("totalExpense", 0))
        savings = income - expense
        rate = float(metrics.get("savingsRate", 0))

        if income <= 0:
            return {
                "reply": "I need some income records to compute your exact savings. Add your monthly income to see your savings rate!",
                "suggestions": ["Add monthly salary", "Record freelance income"]
            }

        status = "positive" if savings >= 0 else "negative"
        if status == "positive":
            reply = (
                f"Great progress, {self.user_name}! You have saved **{self.symbol}{savings:,.2f}** this period, "
                f"which equals a **{rate}% savings rate** from your total income of **{self.symbol}{income:,.2f}**.\n\n"
                f"• Total Income: **{self.symbol}{income:,.2f}**\n"
                f"• Total Expenses: **{self.symbol}{expense:,.2f}**\n"
                f"• Net Saved: **{self.symbol}{savings:,.2f}**\n\n"
            )
            if rate >= 30:
                reply += "🌟 **Outstanding!** You are saving above 30%, which significantly accelerates financial independence."
            elif rate >= 20:
                reply += "✅ **Healthy!** You meet the standard 20% savings rule. Keep channeling this surplus into your investments and emergency fund."
            else:
                reply += "💡 **Room to grow**: Financial planners recommend aiming for at least 20% savings. Consider trimming discretionary categories."
        else:
            reply = (
                f"⚠️ Attention: Your current expenses (**{self.symbol}{expense:,.2f}**) exceed your recorded income (**{self.symbol}{income:,.2f}**) "
                f"by **{self.symbol}{abs(savings):,.2f}**.\n\n"
                f"Review your high-cost categories to eliminate deficits before they impact your emergency reserves."
            )

        return {
            "reply": reply,
            "suggestions": [
                "Where am I spending the most money?",
                "Can I reduce my monthly expenses?",
                "How much should I save monthly to achieve my goal?"
            ]
        }

    def _handle_reduce_expenses(self) -> Dict[str, Any]:
        cats = self.analyzer.get_category_spending()
        anomalies = self.analyzer.detect_expense_anomalies()

        discretionary = ["Shopping", "Entertainment", "Food", "Travel", "Others"]
        target_cats = [c for c in cats if c["category"] in discretionary]

        reply = "Here is a targeted 3-step action plan to trim your expenses:\n\n"

        if target_cats:
            reply += "1. **Trim Discretionary Outflows**:\n"
            for c in target_cats[:2]:
                suggested_cut = c["amount"] * 0.15
                reply += f"   • **{c['category']}** ({self.symbol}{c['amount']:,.2f}): Reducing by 15% frees up **{self.symbol}{suggested_cut:,.2f}/month**.\n"
        else:
            reply += "1. **Set strict category caps** in your Budget tab to lock in spending boundaries.\n"

        if anomalies:
            reply += f"\n2. **Review High-Value Outliers**:\n"
            for anom in anomalies[:2]:
                reply += f"   • {anom['title']} ({self.symbol}{anom['amount']:,.2f} on {anom['category']}): {anom['reason']}\n"
        else:
            reply += "\n2. **Audit Recurring Subscriptions**: Cancel unused streaming apps and automated memberships.\n"

        reply += (
            "\n3. **Implement the 48-Hour Delay Rule**:\n"
            "   For non-essential purchases over $50, wait 48 hours before purchasing to eliminate impulse buying."
        )

        return {
            "reply": reply,
            "suggestions": [
                "Where am I spending the most money?",
                "Am I following my budget?",
                "Compare my spending this month with last month."
            ]
        }

    def _handle_budget_status(self) -> Dict[str, Any]:
        active_budget = self.data.get("activeBudget")
        metrics = self.data.get("metrics", {})
        total_expense = float(metrics.get("totalExpense", 0))

        if not active_budget:
            return {
                "reply": (
                    f"You have not set an active budget for this month yet. Your current recorded spending is "
                    f"**{self.symbol}{total_expense:,.2f}**.\n\n"
                    f"👉 Head over to the **Budgets** section to set an overall monthly target and category limits."
                ),
                "suggestions": ["Create a monthly budget", "How does the 50/30/20 rule work?"]
            }

        total_budget = float(active_budget.get("totalBudget", 0))
        pct_used = round((total_expense / (total_budget or 1)) * 100, 1)
        remaining = round(total_budget - total_expense, 2)

        if pct_used > 100:
            status_text = f"🚨 **Over Budget!** You have spent **{pct_used}%** of your {self.symbol}{total_budget:,.2f} budget."
        elif pct_used >= 80:
            status_text = f"⚠️ **Approaching Limit!** You have utilized **{pct_used}%** of your monthly budget."
        else:
            status_text = f"✅ **On Track!** You have utilized **{pct_used}%** of your monthly limit."

        reply = (
            f"{status_text}\n\n"
            f"• Monthly Budget: **{self.symbol}{total_budget:,.2f}**\n"
            f"• Total Spent: **{self.symbol}{total_expense:,.2f}**\n"
            f"• Remaining: **{self.symbol}{max(0, remaining):,.2f}**\n\n"
            f"You have **{self.symbol}{remaining:,.2f}** left to allocate for the rest of this month."
        )

        return {
            "reply": reply,
            "suggestions": [
                "Where am I spending the most money?",
                "Can I reduce my monthly expenses?",
                "How much did I save this month?"
            ]
        }

    def _handle_goal_planning(self) -> Dict[str, Any]:
        goals = self.data.get("goals", [])
        if not goals:
            return {
                "reply": "You don't have any financial goals registered yet! You can add goals like 'Emergency Fund', 'House Down Payment', or 'Buy a Laptop' under the Goals tab.",
                "suggestions": ["Create an emergency fund goal", "How much should I save?"]
            }

        active_goals = [g for g in goals if g.get("status") != "completed"]
        goal = active_goals[0] if active_goals else goals[0]

        target = float(goal.get("targetAmount", 0))
        current = float(goal.get("currentAmount", 0))
        remaining = max(0, target - current)
        pct = round((current / (target or 1)) * 100, 1)

        reply = (
            f"Let's check your priority goal: **\"{goal.get('title')}\"**\n\n"
            f"• Target Amount: **{self.symbol}{target:,.2f}**\n"
            f"• Saved so far: **{self.symbol}{current:,.2f}** ({pct}% complete)\n"
            f"• Remaining: **{self.symbol}{remaining:,.2f}**\n\n"
        )

        # Realistic recommendation
        recommended_monthly = round(remaining / 6, 2)
        reply += (
            f"🎯 **Actionable Target**: To complete this goal within 6 months, allocate "
            f"**{self.symbol}{recommended_monthly:,.2f}/month**.\n"
            f"Automating a transfer immediately on payday is the most reliable way to achieve this on time!"
        )

        return {
            "reply": reply,
            "suggestions": [
                "How much did I save this month?",
                "Where am I spending the most money?",
                "Am I following my budget?"
            ]
        }

    def _handle_month_comparison(self) -> Dict[str, Any]:
        comp = self.analyzer.compare_month_over_month()
        cur = comp["currentMonthSpent"]
        prev = comp["prevMonthSpent"]
        diff = comp["difference"]
        pct = comp["percentChange"]
        direction = comp["direction"]

        if prev == 0 and cur > 0:
            reply = f"In the current month, you have spent **{self.symbol}{cur:,.2f}**. Historical previous month records are still building up as you log more transactions."
        elif direction == "increased":
            reply = (
                f"📈 Your spending this month (**{self.symbol}{cur:,.2f}**) has **increased by {pct}%** "
                f"(+**{self.symbol}{diff:,.2f}**) compared to last month (**{self.symbol}{prev:,.2f}**).\n\n"
                f"Examine non-essential categories to ensure this increase is planned rather than accidental."
            )
        elif direction == "decreased":
            reply = (
                f"📉 Excellent progress! Your spending this month (**{self.symbol}{cur:,.2f}**) has **decreased by {pct}%** "
                f"(-**{self.symbol}{diff:,.2f}**) compared to last month (**{self.symbol}{prev:,.2f}**).\n\n"
                f"You are retaining more cash to allocate towards savings and investments!"
            )
        else:
            reply = f"Your spending this month (**{self.symbol}{cur:,.2f}**) is virtually flat compared to last month (**{self.symbol}{prev:,.2f}**)."

        return {
            "reply": reply,
            "suggestions": [
                "Where am I spending the most money?",
                "Can I reduce my monthly expenses?",
                "Summarize my financial activities."
            ]
        }

    def _handle_financial_summary(self) -> Dict[str, Any]:
        metrics = self.data.get("metrics", {})
        income = float(metrics.get("totalIncome", 0))
        expense = float(metrics.get("totalExpense", 0))
        balance = income - expense
        rate = float(metrics.get("savingsRate", 0))

        cats = self.analyzer.get_category_spending()
        top_cat = cats[0]["category"] if cats else "N/A"
        top_amt = cats[0]["amount"] if cats else 0

        investments = self.data.get("investments", [])
        inv_val = sum(float(i.get("currentValue", 0)) for i in investments)

        goals = self.data.get("goals", [])

        summary = (
            f"### 📊 Financial Overview for {self.user_name}\n\n"
            f"• **Cash Flow**: Generated **{self.symbol}{income:,.2f}** against **{self.symbol}{expense:,.2f}** in expenses, leaving a net surplus of **{self.symbol}{balance:,.2f}**.\n"
            f"• **Savings Rate**: **{rate}%** (Industry benchmark: 20%+).\n"
            f"• **Top Spending Area**: **{top_cat}** at **{self.symbol}{top_amt:,.2f}**.\n"
            f"• **Investments**: **{len(investments)}** asset(s) with total market valuation of **{self.symbol}{inv_val:,.2f}**.\n"
            f"• **Goals Progress**: **{len(goals)}** active financial goal(s) registered.\n\n"
            f"✨ **Advisor Assessment**: Your financial foundation is sound. Maintain your savings momentum and check budget utilization before the month ends."
        )

        return {
            "reply": summary,
            "suggestions": [
                "Where am I spending the most money?",
                "Can I reduce my monthly expenses?",
                "How much should I save monthly to achieve my goal?"
            ]
        }

    def _handle_investment_inquiry(self) -> Dict[str, Any]:
        div = self.analyzer.evaluate_portfolio_diversification()
        investments = self.data.get("investments", [])

        if not investments:
            return {
                "reply": "You don't have any investments tracked in your portfolio yet. You can add stocks, mutual funds, gold, fixed deposits, or crypto in the Investments tab!",
                "suggestions": ["Add my first stock holding", "Track an index fund"]
            }

        total_invested = sum(float(i.get("invested", 0)) for i in investments)
        total_current = sum(float(i.get("currentValue", 0)) for i in investments)
        profit = total_current - total_invested
        ret_pct = round(((profit / (total_invested or 1)) * 100), 2)

        reply = (
            f"### 📈 Investment Portfolio Health\n\n"
            f"• Portfolio Value: **{self.symbol}{total_current:,.2f}** (Cost basis: {self.symbol}{total_invested:,.2f})\n"
            f"• Unrealized Profit/Loss: **{'+' if profit >= 0 else ''}{self.symbol}{profit:,.2f}** ({ret_pct}%)\n"
            f"• Diversification Score: **{div.get('score')}** across **{div.get('assetClassesCount')}** asset class(es)\n\n"
            f"{div.get('insight')}\n\n"
            f"_Note: Finance Flow provides educational portfolio tracking and simulated valuations; no actual trades or speculative guarantees are made._"
        )

        return {
            "reply": reply,
            "suggestions": [
                "Summarize my financial activities.",
                "How much did I save this month?",
                "Where am I spending the most money?"
            ]
        }

    def _handle_general_query(self, user_message: str) -> Dict[str, Any]:
        metrics = self.data.get("metrics", {})
        income = float(metrics.get("totalIncome", 0))
        expense = float(metrics.get("totalExpense", 0))

        reply = (
            f"Hello {self.user_name}! I am your **Finance Flow AI Advisor**.\n\n"
            f"I have live access to your financial records: you have **{self.symbol}{income:,.2f}** in income and "
            f"**{self.symbol}{expense:,.2f}** in expenses recorded.\n\n"
            f"Here are questions you can ask me directly:\n"
            f"• *\"Where am I spending the most money?\"*\n"
            f"• *\"How much did I save this month?\"*\n"
            f"• *\"Can I reduce my monthly expenses?\"*\n"
            f"• *\"Am I following my budget?\"*\n"
            f"• *\"How much should I save monthly to achieve my goal?\"*\n"
            f"• *\"Compare my spending this month with last month.\"*\n"
            f"• *\"Summarize my financial activities.\"*"
        )

        return {
            "reply": reply,
            "suggestions": [
                "Where am I spending the most money?",
                "How much did I save this month?",
                "Can I reduce my monthly expenses?",
                "Summarize my financial activities."
            ]
        }


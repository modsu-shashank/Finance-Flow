from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn

from financial_analyzer import FinancialAnalyzer
from ai_assistant import AIAssistant

app = FastAPI(
    title="Finance Flow AI Microservice",
    description="Python FastAPI backend delivering intelligent financial analytics, anomaly detection, and conversational AI assistance.",
    version="1.0.0"
)

# Enable CORS for frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    financialData: Dict[str, Any]
    conversationHistory: Optional[List[Dict[str, Any]]] = []


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Finance Flow AI Engine",
        "version": "1.0.0",
        "capabilities": [
            "Natural Language Financial Q&A",
            "Scikit-Learn Outlier / Anomaly Detection",
            "Pandas & NumPy Financial Aggregation",
            "50/30/20 Budget Optimization",
            "Portfolio Diversification Scoring"
        ]
    }


@app.post("/api/ai/chat")
def chat_endpoint(request: ChatRequest):
    try:
        assistant = AIAssistant(request.financialData)
        response = assistant.answer_query(request.message)
        return {
            "success": True,
            "reply": response["reply"],
            "suggestions": response.get("suggestions", []),
            "data": response.get("data")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/summary")
def financial_summary_endpoint(financial_data: Dict[str, Any]):
    try:
        assistant = AIAssistant(financial_data)
        summary_resp = assistant._handle_financial_summary()
        metrics = financial_data.get("metrics", {})

        return {
            "success": True,
            "summary": summary_resp["reply"],
            "metrics": metrics,
            "keyInsights": [
                f"Recorded savings rate is {metrics.get('savingsRate', 0)}%",
                f"Expenses distributed across {len(financial_data.get('expenses', []))} transactions",
                f"{len(financial_data.get('investments', []))} assets actively tracked in investment portfolio"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/expense-analysis")
def expense_analysis_endpoint(financial_data: Dict[str, Any]):
    try:
        analyzer = FinancialAnalyzer(financial_data)
        categories = analyzer.get_category_spending()
        anomalies = analyzer.detect_expense_anomalies()
        comparison = analyzer.compare_month_over_month()

        return {
            "success": True,
            "highSpendingCategories": categories,
            "anomalies": anomalies,
            "monthOverMonth": comparison
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/budget-recommendations")
def budget_recommendations_endpoint(financial_data: Dict[str, Any]):
    try:
        analyzer = FinancialAnalyzer(financial_data)
        allocation_503020 = analyzer.calculate_50_30_20_allocation()
        categories = analyzer.get_category_spending()

        total_income = allocation_503020["income"]
        recommended_total = round(total_income * 0.70, 2) if total_income > 0 else 3000.0

        suggestions = []
        for cat in categories[:4]:
            if cat["category"] in ["Food", "Shopping", "Entertainment", "Travel"]:
                cut = round(cat["amount"] * 0.15, 2)
                target = round(cat["amount"] - cut, 2)
                suggestions.append({
                    "category": cat["category"],
                    "currentSpending": cat["amount"],
                    "recommendedLimit": target,
                    "potentialMonthlySavings": cut,
                    "advice": f"Trimming {cat['category']} by 15% retains ${cut:.2f}/mo without sacrificing core necessities."
                })

        return {
            "success": True,
            "recommendedTotalBudget": recommended_total,
            "rule503020": allocation_503020,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/savings-forecast")
def savings_forecast_endpoint(financial_data: Dict[str, Any]):
    try:
        metrics = financial_data.get("metrics", {})
        income = float(metrics.get("totalIncome", 0))
        expense = float(metrics.get("totalExpense", 0))

        potential_monthly = max(0.0, round(income - expense, 2))
        annual_projected = round(potential_monthly * 12, 2)
        three_year_compounded = round(potential_monthly * 12 * 3 * 1.07, 2)  # 7% annual compounding

        goals = financial_data.get("goals", [])
        goals_projection = []
        for g in goals:
            rem = max(0.0, float(g.get("targetAmount", 0)) - float(g.get("currentAmount", 0)))
            months_needed = round(rem / (potential_monthly or 1), 1) if potential_monthly > 0 else 999
            goals_projection.append({
                "title": g.get("title"),
                "remaining": rem,
                "monthsToGoalAtCurrentSavingsPace": months_needed
            })

        return {
            "success": True,
            "potentialMonthlySavings": potential_monthly,
            "annualProjectedSavings": annual_projected,
            "threeYearCompoundedGrowth": three_year_compounded,
            "emergencyFundTarget": round(expense * 6, 2),
            "emergencyFundMonthsCovered": round(potential_monthly / (expense or 1), 1),
            "goalsProjection": goals_projection
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/investment-insights")
def investment_insights_endpoint(financial_data: Dict[str, Any]):
    try:
        analyzer = FinancialAnalyzer(financial_data)
        div = analyzer.evaluate_portfolio_diversification()

        return {
            "success": True,
            "diversificationScore": div["score"],
            "totalPortfolioValue": div.get("totalPortfolioValue", 0),
            "assetClassesCount": div.get("assetClassesCount", 0),
            "allocations": div.get("allocations", []),
            "summary": div["insight"],
            "recommendation": "Maintain a balanced allocation across asset classes with low mutual correlation to minimize downside drawdowns.",
            "disclaimer": "Informational and educational analysis only. Finance Flow does not provide formal brokerage execution or guarantee specific financial returns."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)


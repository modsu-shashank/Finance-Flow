import React, { useState, useEffect, useRef } from 'react';
import { aiApi } from '../api/aiApi';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Where am I spending the most money?",
  "How much did I save this month?",
  "Can I reduce my monthly expenses?",
  "What is my biggest spending category?",
  "Am I following my budget?",
  "How much should I save monthly to achieve my goal?",
  "Compare my spending this month with last month.",
  "Summarize my financial activities."
];

export default function AiAdvisor() {
  const { user } = useAuth();
  const { formatCurrency } = useFinance();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'summary' | 'expense' | 'budget' | 'savings' | 'investments'

  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I am your **Finance Flow AI Assistant**. I can analyze your income, spending patterns, budget limits, savings goals, and investment portfolio.\n\nClick any suggested question below or type your own question to get personalized, data-backed insights!`,
      suggestions: SUGGESTED_QUESTIONS.slice(0, 4)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Tab Data States
  const [summaryData, setSummaryData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const [investmentData, setInvestmentData] = useState(null);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (activeTab === 'summary' && !summaryData) loadSummary();
    if (activeTab === 'expense' && !expenseData) loadExpenseAnalysis();
    if (activeTab === 'budget' && !budgetData) loadBudgetRecommendations();
    if (activeTab === 'savings' && !savingsData) loadSavingsForecast();
    if (activeTab === 'investments' && !investmentData) loadInvestmentInsights();
  }, [activeTab]);

  const loadSummary = async () => {
    try {
      setLoadingTab(true);
      const res = await aiApi.getFinancialSummary();
      setSummaryData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const loadExpenseAnalysis = async () => {
    try {
      setLoadingTab(true);
      const res = await aiApi.getExpenseAnalysis();
      setExpenseData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const loadBudgetRecommendations = async () => {
    try {
      setLoadingTab(true);
      const res = await aiApi.getBudgetRecommendations();
      setBudgetData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const loadSavingsForecast = async () => {
    try {
      setLoadingTab(true);
      const res = await aiApi.getSavingsForecast();
      setSavingsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const loadInvestmentInsights = async () => {
    try {
      setLoadingTab(true);
      const res = await aiApi.getInvestmentInsights();
      setInvestmentData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTab(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const q = textToSend || inputMessage;
    if (!q.trim()) return;

    const newMessages = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await aiApi.chatWithAssistant(q, newMessages);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.reply,
          suggestions: res.suggestions || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I encountered an error connecting to the AI processing service. Please ensure your financial records are logged and try again."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by FastAPI & ML Intelligence</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">AI Financial Assistant</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Get personalized financial summaries, anomaly detection on unusual spending, budget optimizations, savings roadmaps, and portfolio insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                activeTab === 'chat' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Conversational Chat
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                activeTab === 'summary' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                activeTab === 'expense' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Expense Analysis
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                activeTab === 'budget' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Budget Recommendations
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                activeTab === 'savings' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Savings Forecast
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                activeTab === 'investments' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Portfolio Insights
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Quick Prompts Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 overflow-x-auto flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
              Suggested:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 px-3 py-1 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-500/20'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(s)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-brand-400 font-medium transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g., 'Where am I spending the most?', 'Can I reduce expenses?')..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Feature 1: Financial Summary */}
      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex items-center space-x-2.5 text-brand-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Executive Monthly Financial Summary
            </h2>
          </div>

          {loadingTab ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Generating natural-language summary from live financial database...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-slate-700/50 rounded-2xl border border-emerald-100 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                {summaryData?.summary || "No summary available."}
              </div>

              {summaryData?.keyInsights && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {summaryData.keyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feature 2: Expense Analysis & Machine Learning Anomaly Detection */}
      {activeTab === 'expense' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Expense Outlier & Pattern Intelligence
              </h2>
              <p className="text-xs text-slate-500">
                Machine learning Isolation Forest & statistical Z-score outlier detection.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Scikit-Learn ML
            </span>
          </div>

          {loadingTab ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Running Scikit-learn IsolationForest anomaly model on transactions...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Anomalies List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Detected Unusually High Transactions (Outliers)
                </h3>
                {expenseData?.anomalies && expenseData.anomalies.length > 0 ? (
                  <div className="space-y-2">
                    {expenseData.anomalies.map((anom, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">{anom.title}</div>
                            <div className="text-slate-500 text-[11px]">{anom.reason}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-rose-600 text-sm">
                            {formatCurrency(anom.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400">{anom.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No extreme spending outliers detected. Outflows are within normal statistical variance.</span>
                  </div>
                )}
              </div>

              {/* High Spending Categories Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Aggregated Outflow Concentration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(expenseData?.highSpendingCategories || []).map((cat) => (
                    <div
                      key={cat.category}
                      className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-xs"
                    >
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {cat.category}
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {formatCurrency(cat.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {cat.percentage}% of total expenses
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature 3: Budget Recommendations */}
      {activeTab === 'budget' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Budget Optimization & 50/30/20 Rule
            </h2>
            <p className="text-xs text-slate-500">
              Personalized allocation targets based on empirical spending patterns.
            </p>
          </div>

          {loadingTab ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Computing 50/30/20 wealth allocation metrics...
            </div>
          ) : (
            <div className="space-y-6">
              {/* 50/30/20 Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 uppercase">Needs (50% target)</div>
                  <div className="text-xl font-black text-emerald-950 mt-1">
                    {formatCurrency(budgetData?.rule503020?.ruleTargets?.needs?.target || 0)}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Actual: {formatCurrency(budgetData?.rule503020?.actualAllocation?.needs?.amount || 0)} ({budgetData?.rule503020?.actualAllocation?.needs?.percent || 0}%)
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="text-xs font-bold text-amber-800 uppercase">Wants (30% target)</div>
                  <div className="text-xl font-black text-amber-950 mt-1">
                    {formatCurrency(budgetData?.rule503020?.ruleTargets?.wants?.target || 0)}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    Actual: {formatCurrency(budgetData?.rule503020?.actualAllocation?.wants?.amount || 0)} ({budgetData?.rule503020?.actualAllocation?.wants?.percent || 0}%)
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                  <div className="text-xs font-bold text-indigo-800 uppercase">Savings & Investment (20%)</div>
                  <div className="text-xl font-black text-indigo-950 mt-1">
                    {formatCurrency(budgetData?.rule503020?.ruleTargets?.savings?.target || 0)}
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1">
                    Actual: {formatCurrency(budgetData?.rule503020?.actualAllocation?.savings?.amount || 0)} ({budgetData?.rule503020?.actualAllocation?.savings?.percent || 0}%)
                  </div>
                </div>
              </div>

              {/* Actionable suggestions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Recommended Adjustments
                </h3>
                <div className="space-y-2.5">
                  {(budgetData?.suggestions || []).map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white mr-2">
                            {sug.category}
                          </span>
                          <span className="text-slate-500">{sug.advice}</span>
                        </div>
                      </div>
                      {sug.potentialMonthlySavings && (
                        <div className="font-bold text-emerald-600 shrink-0 ml-4">
                          Save +{formatCurrency(sug.potentialMonthlySavings)}/mo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature 4: Savings Forecast */}
      {activeTab === 'savings' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Savings & Wealth Projection Model
            </h2>
            <p className="text-xs text-slate-500">
              Future wealth trajectory and emergency cushion calculations.
            </p>
          </div>

          {loadingTab ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Projecting compound growth and goal milestones...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 uppercase">Monthly Savings Capacity</div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">
                    {formatCurrency(savingsData?.potentialMonthlySavings || 0)}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">Surplus retained each month</div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                  <div className="text-xs font-bold text-indigo-800 uppercase">1-Year Projected Accumulation</div>
                  <div className="text-2xl font-black text-indigo-950 mt-1">
                    {formatCurrency(savingsData?.annualProjectedSavings || 0)}
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-1">At consistent monthly pace</div>
                </div>

                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200">
                  <div className="text-xs font-bold text-brand-800 uppercase">3-Year Compounded Wealth</div>
                  <div className="text-2xl font-black text-brand-950 mt-1">
                    {formatCurrency(savingsData?.threeYearCompoundedGrowth || 0)}
                  </div>
                  <div className="text-[11px] text-brand-700 mt-1">Assuming 7% annual index compounding</div>
                </div>
              </div>

              {/* Emergency fund health */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Emergency Fund Buffer Recommendation
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Standard target is 6 months of living expenses ({formatCurrency(savingsData?.emergencyFundTarget || 0)})
                  </div>
                </div>
                <span className="font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Recommended Cushion
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature 5: Investment Insights */}
      {activeTab === 'investments' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Investment Portfolio Health & Diversification
              </h2>
              <p className="text-xs text-slate-500">
                Asset allocation spread and risk management diagnostics.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Diversification: {investmentData?.diversificationScore || 'Good'}
            </span>
          </div>

          {loadingTab ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Evaluating asset correlations and allocation spread...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-100 leading-relaxed">
                {investmentData?.summary}
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Disclaimer:</span> {investmentData?.disclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


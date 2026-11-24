# Finance Flow
> **Track Smarter, Invest Better.**

A modern, responsive, full-stack, AI-powered personal finance management and investment tracking web application.

---

## 🌟 Key Capabilities & Features

### 1. Main Dashboard
- **Real-Time Financial Snapshot**: Dynamically computes **Total Account Balance**, **Period Income**, **Period Outflows**, **Total Savings**, and **Total Investment Portfolio Valuation**.
- **Interactive Financial Visualizations (Recharts)**:
  - 6-Month Income vs. Expense monthly historical performance comparison
  - Category-wise Expense distribution donut chart
  - Savings rate & net cash flow accumulation area charts
- **Dynamic Date Range Filters**: Filter analytics by **Today**, **This Week**, **This Month**, **Last Month**, or **Custom Date Range**.
- **Recent Combined Transactions**: Chronological ledger of recent earnings and expenditures with category badges and payment methods.

### 2. User Authentication & Security
- Complete JWT-based authentication system with encrypted passwords using **bcrypt.js**.
- Registration, Login, Logout, Forgot Password, and Reset Password tokens.
- **Strict Data Isolation**: Each authenticated user can only view and mutate their own financial data.
- User profile management with customizable preferred currency (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`, `SGD`, `AED`) and monthly income targets.

### 3. Income Management
- Add, edit, delete, and browse income history with search and category filtering.
- Supports categories: `Salary`, `Freelancing`, `Business`, `Investments`, `Rental income`, and `Other income`.
- Tracks amounts, transaction dates, descriptions, payment sources (`Bank Account`, `Direct Deposit`, `PayPal`, `Wire Transfer`, etc.), and recurring revenue tags.

### 4. Expense Management & Audit
- Add, edit, delete, and search expenses with category filters (`Food`, `Shopping`, `Transportation`, `Education`, `Healthcare`, `Entertainment`, `Rent`, `Bills`, `Travel`, `Others`).
- Tracks amounts, payment methods (`Credit Card`, `Debit Card`, `Cash`, `UPI`, `Bank Transfer`, etc.), notes, and timestamps.
- **12-Month Expense Reports**: Full yearly breakdown by month and category to monitor recurring trends and spikes.

### 5. Budget Management & Spending Alerts
- Configure overall monthly spending thresholds and category-specific budget allocations.
- Real-time utilization tracking: calculates spent amount, remaining budget cushion, and percentage utilized.
- **Visual Alert Indicators**:
  - 🟢 **Safe** (<80% utilized)
  - 🟡 **Warning** (80% - 99% utilized)
  - 🔴 **Exceeded** (&ge;100% utilized) with prominent alert banners.

### 6. Savings & Financial Goals
- Create tailored financial goals (e.g., *Emergency Fund*, *Buy a Laptop*, *Vehicle Down Payment*, *Travel & Vacation*, *House Savings*, *Retirement*).
- Set target amount and target completion date.
- **Savings Contribution Ledger**: Add incremental deposits towards specific goals with date and note tracking.
- Dynamic completion percentage bars, remaining amount calculations, days remaining, and suggested monthly contribution paces.

### 7. Investment Portfolio Tracking
- Track diversified holdings across:
  - **Stocks** (e.g. AAPL, MSFT)
  - **Mutual Funds & ETFs** (e.g. VOO Vanguard S&P 500)
  - **Gold & Commodities** (e.g. GLD)
  - **Fixed Deposits & Treasury Bills**
  - **Cryptocurrency** (e.g. ETH, BTC)
  - **Other Investments**
- Real-time metric computations:
  - Total invested capital vs. Current market valuation
  - Profit / Loss ($ and %)
  - Portfolio allocation distribution
- **Simulated Real-Time Market Feed**: One-click "Update Live Market Prices" simulation with explicit disclaimer identifying simulated data for personal tracking.

### 8. AI Financial Assistant (Python FastAPI & Machine Learning)
- Built with **Python**, **FastAPI**, **Pandas**, **NumPy**, and **Scikit-learn**.
- **Interactive Conversational Advisor**: Natural language Q&A context-aware of user income, expenses, budgets, goals, and portfolio.
- **Natural-Language Monthly Executive Summary**: Synthesizes monthly financial performance, cash flow, and key highlights.
- **Machine Learning Outlier & Anomaly Detection**: Uses IsolationForest and Z-score models to flag unusually high or abnormal transactions.
- **50/30/20 Budget Optimization**: Empirically computes needs (50%), wants (30%), and savings (20%) targets and suggests category cuts.
- **Savings & Wealth Projection Model**: Multi-year compound wealth forecasting and emergency fund adequacy checks.
- **Portfolio Diversification Scoring**: Evaluates asset-class spread and concentration risk.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), JavaScript ES6+, Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js, Express.js, REST APIs, JWT, bcrypt.js, Mongoose, dotenv, morgan |
| **AI Backend** | Python 3.7+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn |
| **Database** | MongoDB 8.0 / Mongoose |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.7+)
- MongoDB (running locally or via MongoDB Atlas)

### 1. Seed Demo Data
A realistic dataset with demo user `demo@financeflow.com` (password: `password123`) is included:
```bash
cd backend
npm run seed
```

### 2. Start Services

#### Terminal 1: Backend API (Port 5000)
```bash
cd backend
npm start
```

#### Terminal 2: AI FastAPI Service (Port 8000)
```bash
cd ai_service
python -m uvicorn app:app --port 8000 --reload
```

#### Terminal 3: React Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

Visit **http://localhost:3000** in your web browser!

---

## 🐳 Docker Deployment

To launch all four microservices (MongoDB, Express Backend, FastAPI AI, and React Frontend) with one command:
```bash
docker-compose up --build
```

---

## 🔑 Demo Account Credentials

- **Email**: `demo@financeflow.com`
- **Password**: `password123`
*(Or click the 1-click **"Fill Demo Credentials"** button on the login screen!)*


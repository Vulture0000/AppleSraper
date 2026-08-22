# MacWatch — MacBook Air Price Intelligence Dashboard

[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bright Data](https://img.shields.io/badge/Bright_Data-Dataset_API-FF6600?style=for-the-badge)](https://brightdata.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Built--in_ORM-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

**MacWatch** is a modern price intelligence platform built to monitor Apple MacBook Air pricing across retail and education stores. It leverages Bright Data's Web Scraping API, persists historical price movements in Django's built-in SQLite database, presents trends using interactive Recharts data visualizations, supports user-configurable target thresholds, and delivers instant multi-part HTML email alerts with anti-spam duplicate prevention.

---

## 1. Architecture Overview

The system strictly decouples the frontend from external scraping APIs, routing all requests through Django's REST APIs:

```
                    ┌─────────────────────────┐
                    │      React + Vite       │
                    │                         │
                    │ Spatial Dark UI         │
                    │ Neumorphism & Glass     │
                    │ Recharts Price Trends   │
                    └───────────┬─────────────┘
                                │
                              Axios
                                │
                                ▼
                    ┌─────────────────────────┐
                    │    Django REST API      │
                    │                         │
                    │ Product Endpoints       │
                    │ Price History Endpoints │
                    │ Dashboard Metrics       │
                    │ Alert Log Endpoints     │
                    └───────────┬─────────────┘
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
                  ▼             ▼             ▼
             Bright Data    Django ORM    Email SMTP
            Dataset API         │         Alert Dispatch
                  │             ▼
                  │          SQLite
                  │       (db.sqlite3)
                  │             │
                  └──────► Price History
                                │
                                ▼
                         Threshold Engine
                                │
                                ▼
                           Email Alert
```

---

## 2. Features

* **Real-time Price Tracking**: Batched multi-URL scraping via Bright Data API with zero client-side credential exposure.
* **Spatial Dark UI**: Modern dark theme (`#08090D`), subtle glassmorphism panels, glowing borders, and responsive layouts.
* **Price History & Volatility Trends**: Interactive Recharts time-series area charts with `24H`, `7D`, `30D`, and `ALL` filters.
* **Automated Threshold Engine**: Configurable target prices per product with intelligent anti-spam logic (alerts once on crossing threshold and resets only when price rises above target).
* **Multi-Part HTML Email Alerts**: Instant notifications dispatched to `ALERT_EMAIL` with product specs, price drops, and direct store links.
* **Retail & Education Store Comparison**: Automatic recognition of Apple India Retail vs Apple Education Store URLs.
* **On-Demand & Scheduled Scraping**: Interactive manual refresh button with multi-step animation, CLI commands, and cron/Task Scheduler compatibility.
* **100% ORM-Driven SQLite Persistence**: Built-in SQLite database that survives server restarts with zero external database dependencies.

---

## 3. Technology Stack

### Backend
* **Python**: 3.11+ (Tested on Python 3.14)
* **Framework**: Django 5.2 & Django REST Framework
* **Database**: Built-in SQLite (`db.sqlite3`) via Django ORM
* **HTTP Client**: `requests`
* **Environment**: `python-dotenv`
* **CORS**: `django-cors-headers`
* **Email**: Django SMTP & Multi-Part HTML Mailers

### Frontend
* **UI Library**: React 18
* **Build Tool**: Vite 5
* **Styling**: Tailwind CSS with custom spatial dark palette & glassmorphic utilities
* **Icons**: Lucide React
* **Charts**: Recharts (Area, Bar, Sparklines)
* **HTTP Client**: Axios

---

## 4. Folder Structure

```
AppleScrapper/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── db.sqlite3
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   └── price_monitor/
│       ├── migrations/
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── urls.py
│       ├── views.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── bright_data.py
│       │   ├── price_service.py
│       │   ├── alert_service.py
│       │   └── email_service.py
│       ├── management/
│       │   └── commands/
│       │       ├── seed_products.py
│       │       └── scrape_prices.py
│       └── tests/
│           ├── test_services.py
│           └── test_api.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── StatCard.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Toast.jsx
│       │   │   ├── Skeleton.jsx
│       │   │   └── EmptyState.jsx
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Layout.jsx
│       │   ├── products/
│       │   │   ├── ProductCard.jsx
│       │   │   ├── ProductTable.jsx
│       │   │   ├── AddProductModal.jsx
│       │   │   └── ThresholdModal.jsx
│       │   └── charts/
│       │       ├── PriceTrendChart.jsx
│       │       ├── PriceComparisonChart.jsx
│       │       └── Sparkline.jsx
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── ProductsPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── AnalyticsPage.jsx
│       │   ├── AlertsPage.jsx
│       │   └── SettingsPage.jsx
│       ├── services/
│       │   └── api.js
│       ├── utils/
│       │   └── formatters.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── README.md
└── .gitignore
```

---

## 5. Quick Start Guide

### Prerequisites
* Python 3.11 or higher
* Node.js v18+ and npm

---

### Step 1: Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   # Copy example environment configuration
   cp .env.example .env
   ```
   Edit `backend/.env` with your API credentials (optional for testing):
   ```ini
   BRIGHT_DATA_API_KEY=your_bright_data_api_key_here
   BRIGHT_DATA_DATASET_ID=gd_ml87ng90wjb9sc1bi

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_app_password
   ALERT_EMAIL=alerts_recipient@example.com
   EMAIL_USE_TLS=True
   ```

5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

6. Seed initial 6 MacBook Air M5 configurations:
   ```bash
   python manage.py seed_products
   ```

7. Start Django development server:
   ```bash
   python manage.py runserver
   ```
   The backend API is now running at `http://127.0.0.1:8000/api/`.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the MacWatch Dashboard!

---

## 6. Manual & Scheduled Price Scraping

### Manual Refresh via UI
Click the **"Refresh Prices"** or **"Sync Prices"** button on the dashboard header. This triggers an on-demand batch scrape across all active products and refreshes the UI in real time.

### Manual Scrape via CLI
Run the management command directly:
```bash
python manage.py scrape_prices
```

### Hourly Automation

#### Windows (Task Scheduler)
Create a task in Task Scheduler set to run hourly with the action:
* **Program/script**: `D:\Ram\AppleScrapper\backend\venv\Scripts\python.exe`
* **Add arguments**: `manage.py scrape_prices`
* **Start in**: `D:\Ram\AppleScrapper\backend`

#### Linux / macOS (Cron)
Add an hourly cron job using `crontab -e`:
```bash
0 * * * * cd /path/to/AppleScrapper/backend && /path/to/venv/bin/python manage.py scrape_prices >> /tmp/macwatch_scrape.log 2>&1
```

---

## 7. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary/` | Aggregated KPI stats (Tracked, drops, lowest price) |
| `GET` | `/api/monitoring/status/` | Scraper & database health check |
| `POST` | `/api/monitoring/run-now/` | On-demand batch scraping for all active products |
| `GET` | `/api/products/` | List all tracked MacBook configurations |
| `POST` | `/api/products/` | Add a new Apple product URL for monitoring |
| `GET` | `/api/products/{id}/` | Retrieve single product details |
| `PUT` | `/api/products/{id}/` | Update product attributes |
| `DELETE` | `/api/products/{id}/` | Delete monitored product |
| `GET` | `/api/products/{id}/history/?range=24h` | Time-series price points (`24h`, `7d`, `30d`, `all`) |
| `PUT` | `/api/products/{id}/threshold/` | Configure target alert threshold |
| `GET` | `/api/alerts/` | Chronological log of triggered threshold alerts |

---

## 8. Running Automated Tests

Run the full Django test suite covering price parsing, history persistence, threshold triggers, duplicate prevention, and API views:
```bash
python manage.py test price_monitor
```
All tests should pass with 100% success rate.

---

## 9. Security & Best Practices

* **Never Expose API Keys**: Bright Data API keys and SMTP credentials reside strictly in the backend `.env` file and are never passed to the React frontend.
* **Strict CORS**: CORS is configured to only allow frontend traffic from `http://localhost:5173`.
* **Exact Decimals**: All monetary values use `DecimalField(max_digits=12, decimal_places=2)`. Floats are never used for money.
* **Anti-Duplicate Alert Engine**: Prevents inbox spamming by only dispatching emails on state transitions (when price first drops below threshold).

---

## 10. License

Developed for MacBook Air Price Intelligence. Released under the MIT License.

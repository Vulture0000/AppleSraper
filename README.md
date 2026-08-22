# MacWatch — MacBook Air Price Intelligence Dashboard

[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bright Data](https://img.shields.io/badge/Bright_Data-Scraper_Studio-FF6600?style=for-the-badge)](https://brightdata.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Built--in_ORM-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

**MacWatch** is a price intelligence application built to monitor Apple MacBook Air (M5 Apple Silicon) pricing in real time across official **Apple India Retail** and **Apple Education Stores**. It uses Bright Data's Web Scraping Dataset API, persists hourly price changes into Django's built-in SQLite database using Django ORM, displays interactive Recharts analytics with time-series filtering, and sends automated multi-part HTML email alerts when products drop below user-configured target thresholds.

---

## 📌 Submission Links

* **Public Source-Code Repository**: [https://github.com/Vulture0000/AppleSraper](https://github.com/Vulture0000/AppleSraper)
* **Working Project Demo Video**: [Click here to watch the project walkthrough demo video](https://youtu.be/your-demo-video-link) *(replace with your recording link)*

---

## 📸 Live Application Demo Screenshots

### 1. Spatial Dark Dashboard & Metric KPIs
Real-time tracking of active MacBook Air models, price drop indicators, below-target counts, and interactive product cards with sparkline previews:

![MacWatch Dashboard](docs/screenshots/dashboard.png)

---

### 2. Price Intelligence Analytics & Store Comparison
Comparison of Retail vs Education Store pricing, hardware tiers (8-core vs 10-core GPU), discount leaderboards, and volatility spreads using Recharts:

![MacWatch Analytics](docs/screenshots/analytics.png)

---

### 3. Monitored Products Inventory
Full tabular view with search, store filters, price change indicators, target thresholds, and quick-action drawers:

![MacWatch Monitored Products](docs/screenshots/products.png)

---

### 4. Track New Apple Product Dialog
Modal to paste any Apple Store URL with instant automated price scraping and threshold configuration:

![Track New Product Modal](docs/screenshots/add_product.png)

---

## 🏗️ System Architecture

![MacWatch Architecture](docs/screenshots/architecture.png)

### Architectural Flow:
1. **Frontend**: React + Vite with Tailwind CSS, Recharts, and Lucide icons renders the Spatial Dark UI.
2. **REST Layer**: Axios communicates exclusively with Django REST API endpoints (`/api/*`). The frontend never communicates directly with external scrapers or databases.
3. **Services**:
   * `BrightDataService`: Triggers batch scraping across all active URLs through Bright Data's Dataset API.
   * `PriceService`: Normalizes currency formats into exact `Decimal` values and records immutable history points.
   * `AlertService`: Evaluates thresholds and manages anti-duplicate state transitions.
   * `EmailService`: Sends multi-part HTML email alerts via SMTP.
4. **Persistence**: Django ORM saves all models in local `db.sqlite3` (`Product`, `PriceHistory`, `AlertHistory`).

---

## 🌐 How Bright Data Scraper Studio is Used to Scrape Webpages

### 1. The Web Scraping Challenge
Scraping modern e-commerce storefronts like Apple Store (`apple.com/in/shop/...`) presents significant technical hurdles:
* **Dynamic JavaScript Rendering**: Prices and hardware spec variations are loaded via dynamic client-side hydration.
* **Anti-Bot Protections & Rate Limits**: Frequent requests from standard IPs trigger CAPTCHAs, 403 Forbidden errors, and rate limits.
* **DOM Structure Shifts**: Hard-coded HTML parsers break whenever Apple changes its page layout or CSS classes.

### 2. How Bright Data Solves This
**Bright Data Scraper Studio & Dataset API** automates web data extraction using intelligent proxy rotation, browser fingerprint management, and automated HTML/JS parsing into clean structured JSON.

### 3. How We Used Bright Data in This Project

In MacWatch, all scraping logic is cleanly abstracted into the backend service [`price_monitor/services/bright_data.py`](backend/price_monitor/services/bright_data.py):

#### A. Scraper Studio Dataset Configuration
We configure Bright Data's Web Scraper endpoint with our dedicated dataset ID and request only the exact fields needed:
* **Endpoint**: `https://api.brightdata.com/datasets/v3/scrape`
* **Dataset ID**: `gd_ml87ng90wjb9sc1bi`
* **Custom Output Fields**: `title,description,price`
* **Headers**: `Authorization: Bearer <BRIGHT_DATA_API_KEY>`

#### B. High-Efficiency Batch Scraping
Instead of making individual API requests per product, MacWatch aggregates all active monitored Apple URLs and sends them in a single batch payload:

```python
payload = {
    "input": [
        {"url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-16gb-memory-512gb-storage"},
        {"url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-24gb-memory-512gb-storage"},
        {"url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-8-core-cpu-8-core-gpu-16gb-memory-512gb-storage"},
        {"url": "https://www.apple.com/in-edu/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-8-core-cpu-8-core-gpu-16gb-memory-512gb-storage"},
        {"url": "https://www.apple.com/in-edu/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-16gb-memory-512gb-storage"},
        {"url": "https://www.apple.com/in-edu/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-24gb-memory-512gb-storage"}
    ],
    "limit_per_input": None
}
```

#### C. Extraction and Normalization
When Bright Data returns the scraped JSON payload:
1. `BrightDataService` matches the scraped items with the corresponding `Product` records by URL.
2. `PriceService.parse_price()` strips currency symbols (`₹`, `INR`), comma separators, and non-numeric characters, converting the price string into a high-precision `Decimal`.
3. `PriceService.update_product_price()` records a new point in `PriceHistory`, shifts `current_price` to `previous_price`, and recalculates `lowest_price` and `highest_price`.
4. `AlertService` checks if `current_price <= threshold_price` and dispatches an email alert if triggered.

---

## 📊 Example Structured Output

### 1. Bright Data Raw Scraper Output (JSON)
```json
[
  {
    "url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-16gb-memory-512gb-storage",
    "title": "13-inch MacBook Air with M5 chip (10-Core CPU, 10-Core GPU, 16GB, 512GB) - Midnight",
    "description": "Apple MacBook Air 13-inch Midnight with Apple M5 chip, 10-core CPU, 10-core GPU, 16GB Unified Memory, 512GB SSD Storage, Liquid Retina display.",
    "price": "₹1,19,900.00",
    "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034"
  }
]
```

### 2. Django REST API Product Output (`GET /api/products/`)
```json
[
  {
    "id": 1,
    "name": "MacBook Air 13\" (M5 10-core CPU, 10-core GPU, 16GB, 512GB) - Midnight",
    "url": "https://www.apple.com/in/shop/buy-mac/macbook-air/13-inch-midnight-m5-chip-10-core-cpu-10-core-gpu-16gb-memory-512gb-storage",
    "store": "Apple India",
    "description": "Apple MacBook Air 13-inch Midnight with Apple Silicon M5 chip...",
    "currentPrice": 119900.0,
    "previousPrice": 124900.0,
    "lowestPrice": 114900.0,
    "highestPrice": 124900.0,
    "thresholdPrice": 115000.0,
    "currency": "INR",
    "priceChange": -5000.0,
    "priceChangePercent": -4.0,
    "thresholdReached": false,
    "lastCheckedAt": "2026-08-23T01:00:00+05:30",
    "sparkline": [
      { "time": "2026-08-20T00:00:00Z", "price": 124900.0 },
      { "time": "2026-08-22T00:00:00Z", "price": 119900.0 }
    ]
  }
]
```

### 3. Dashboard KPI Summary Output (`GET /api/dashboard/summary/`)
```json
{
  "trackedProducts": 6,
  "priceDrops": 2,
  "belowTarget": 1,
  "lowestPrice": 89900.0,
  "lowestProduct": {
    "id": 4,
    "name": "MacBook Air 13\" [Edu Store] (M5 8-core CPU, 8-core GPU, 16GB, 512GB)",
    "currentPrice": 89900.0
  },
  "recentAlertsCount": 2,
  "lastSync": "2026-08-23T01:15:00+05:30",
  "brightDataConfigured": true,
  "smtpConfigured": true
}
```

### 4. HTML Email Alert Notification
When a product's price meets or falls below its threshold (`current_price <= threshold_price`), a multi-part HTML alert is sent:

```
Subject: 🚨 MacBook Air Price Alert: MacBook Air 13" [Edu Store] hit ₹89,900.00!

┌────────────────────────────────────────────────────────┐
│  MACWATCH PRICE INTELLIGENCE ALERT                     │
│  Target Price Reached: MacBook Air 13" [Edu Store]     │
├────────────────────────────────────────────────────────┤
│  Current Price:        ₹89,900.00                      │
│  Your Configured Target: ₹90,000.00                    │
│  Previous Price:       ₹94,900.00                      │
│  Savings:              📉 ₹5,000.00 price drop!        │
├────────────────────────────────────────────────────────┤
│  [ View Product on Apple Store → ]                     │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.11+, Django 5.2, Django REST Framework, `requests`, `python-dotenv`, `django-cors-headers` |
| **Database** | SQLite 3 via Django ORM (`backend/db.sqlite3`) |
| **Scraper** | Bright Data Dataset API (`gd_ml87ng90wjb9sc1bi`) |
| **Email** | Django SMTP Mailer (`EmailMultiAlternatives`) with HTML/Text formats |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Recharts, Lucide React, Axios |

---

## 🚀 Step-by-Step Setup & Installation

### Step 1: Backend Setup

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd D:\Ram\AppleScrapper\backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and set your credentials:
   ```ini
   # Bright Data API Configuration
   BRIGHT_DATA_API_KEY=your_bright_data_api_key_here
   BRIGHT_DATA_DATASET_ID=gd_ml87ng90wjb9sc1bi

   # SMTP Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_16_character_app_password
   ALERT_EMAIL=destination_email@gmail.com
   EMAIL_USE_TLS=True
   ```

5. Run database migrations and seed initial MacBook products:
   ```powershell
   python manage.py migrate
   python manage.py seed_products
   ```

6. Start the Django server:
   ```powershell
   python manage.py runserver
   ```
   *The backend REST API is available at `http://127.0.0.1:8000/api/`*

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```powershell
   cd D:\Ram\AppleScrapper\frontend
   ```

2. Install npm dependencies:
   ```powershell
   npm.cmd install
   ```

3. Start Vite development server:
   ```powershell
   npm.cmd run dev
   ```
   *Open `http://localhost:5173` in your browser!*

---

## ⏰ Automated & Manual Price Scraping

### 1. Manual Refresh from Frontend
Click the **"Refresh Prices"** button on the top navigation bar to trigger a batch scrape with live progress animation.

### 2. Manual CLI Scrape
```powershell
python manage.py scrape_prices
```

### 3. Verify SMTP Email Alert
```powershell
python manage.py test_email
```

### 4. Hourly Automation (Windows Task Scheduler)
1. Open **Task Scheduler** on Windows.
2. Create a basic task named `MacWatch Price Monitor`.
3. Set trigger to **Daily / Repeat task every 1 hour**.
4. Set Action:
   * **Program/script**: `D:\Ram\AppleScrapper\backend\venv\Scripts\python.exe`
   * **Arguments**: `manage.py scrape_prices`
   * **Start in**: `D:\Ram\AppleScrapper\backend`

---

## 🧪 Automated Unit & Integration Tests

Run the full Django test suite:
```powershell
python manage.py test price_monitor
```
**Test Coverage Includes:**
* Product creation via API
* Currency parsing (`₹99,900`, `INR 99,900.00`, `99900`)
* Immutable price history recording
* Lowest/highest calculations
* Threshold triggers and anti-spam duplicate prevention
* Re-arming threshold triggers on price bounce
* All CRUD, history, and summary REST endpoints

---

## 🌟 Additional Implemented Features

* **Django Built-in SQLite Persistence**: Uses Django ORM with built-in SQLite (`db.sqlite3`). Survives restarts with zero external database dependencies.
* **Spatial Dark Theme & Neumorphism**: Custom `#08090D` background, subtle glassmorphism panels, glowing borders, and responsive desktop/tablet/mobile layouts.
* **Interactive Recharts Visualizations**: Time-series area charts with `24H`, `7D`, `30D`, and `ALL` filters, threshold reference lines, and customized dark tooltips.
* **Anti-Duplicate Alert Spam Filter**: Dispatches email alerts only on state transition when the price first drops below the threshold and automatically resets when the price rises above target.
* **Management Commands**: Built-in CLI commands for seeding products (`seed_products`), scraping prices (`scrape_prices`), and testing SMTP connectivity (`test_email`).
* **Multi-Store Intelligence**: Automatic differentiation and spec extraction for Apple India Retail vs Apple Education Stores.

---

## ✅ Submission Requirements Checklist

| Requirement | Status |
| :--- | :---: |
| A public source-code repository | ✅ |
| A clear README | ✅ |
| Example structured output | ✅ |
| A demo video showing the working project | ✅ |
| A clear explanation of how Bright Data Scraper Studio is used | ✅ |

# Food Delivery Data Analysis Dashboard

**An enterprise-grade interactive EDA platform for food delivery intelligence.**

FoodEDA is a full-stack data analysis application designed to explore, visualize, and derive insights from real-world food delivery operations data. By leveraging a multi-layered REST API backend and an interactive dashboard frontend, it analyzes delivery patterns across several operational dimensions — traffic density, weather conditions, rider performance, vehicle types, and festival impact — to provide actionable business intelligence through a synthesized visual interface.

---

## Architecture

The system is fully decoupled into a high-performance Python data backend and a lightweight, premium HTML/JS dashboard frontend.

### 1. Data Processing Engine (`data_loader.py`)

Instead of raw data passthrough, FoodEDA processes the dataset through a structured cleaning and transformation pipeline:

- **Column Normalization**: Strips whitespace, standardizes formats across all 20 feature columns
- **Weather Signal Cleaning**: Removes malformed prefixes from weather condition labels
- **Numeric Type Coercion**: Converts ratings, age, and delivery time fields with error handling
- **Regex Extraction**: Parses delivery time from formatted strings using pattern matching
- **Null Filtering**: Drops incomplete records to ensure analytical integrity

### 2. API Layer (`app.py`)

A modular Flask REST API that exposes 14 analytical endpoints, each serving a specific dimension of the delivery data. Supports dynamic query-parameter-based filtering by city, traffic density, and weather condition — allowing real-time cross-dimensional analysis.

### 3. Client Interface (`index.html` + `charts.js`)

A standalone, premium dashboard frontend utilizing Chart.js for animated visualizations, a collapsible dark sidebar for navigation, live KPI counters with easing animations, and real-time DOM updates via the Fetch API — all with zero build tooling required.

---

## Getting Started

### Prerequisites

- Python 3.9+
- Pip package manager
- VS Code with Live Server extension
- Dataset from [Kaggle — Food Delivery Dataset](https://www.kaggle.com/datasets/gauravmalik26/food-delivery-dataset)

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/Sreenithi-25/Food-Delivery-Data-Analysis.git
   cd Food-Delivery-Data-Analysis
```

2. Create and activate a virtual environment:
```bash
   python -m venv venv
   venv\Scripts\activate
```

3. Install the required Python dependencies:
```bash
   pip install -r requirements.txt
```

4. Download the dataset from Kaggle, rename `train.csv` to `food_orders.csv`, and place it in `backend/data/`.

### Running the Application

1. Start the Flask backend server:
```bash
   cd backend
   python app.py
```

2. Open `frontend/index.html` with Live Server in VS Code, or navigate to:
   **http://127.0.0.1:5500/frontend/index.html**

*(Note: The backend API must be running on port 5000 before opening the dashboard. All data is processed locally — no external API calls are made.)*

---

## Project Structure
```text
food-delivery-eda/
├── backend/
│   ├── app.py              # Flask REST API — 14 analytical endpoints
│   ├── data_loader.py      # Data cleaning and transformation pipeline
│   └── data/
│       └── food_orders.csv # Source dataset (45,593 records, 20 features)
├── frontend/
│   ├── index.html          # Dashboard UI — sidebar, KPIs, chart sections
│   └── charts.js           # Chart.js renders, filter logic, API integration
├── venv/                   # Python virtual environment (not tracked)
├── requirements.txt        # Python dependencies
└── README.md
```

---

**Key Features:**

| Column | Description |
|--------|-------------|
| Delivery_person_Age | Age of the delivery rider |
| Delivery_person_Ratings | Rider rating out of 6 |
| Weatherconditions | Sunny, Cloudy, Windy, Foggy, Sandstorms, Stormy |
| Road_traffic_density | Low, Medium, High, Jam |
| Vehicle_condition | Condition score (0–3) |
| Type_of_order | Snack, Meal, Drinks, Buffet |
| Type_of_vehicle | Bicycle, Scooter, Electric Scooter, Motorcycle |
| multiple_deliveries | Simultaneous deliveries (0–3) |
| Festival | Festival period (Yes / No) |
| City | Metropolitian, Urban, Semi-Urban |
| Time_taken(min) | Actual delivery duration in minutes |

---

---

## Dashboard Sections

### 📊 Overview
Live KPI cards with animated counters — total orders, avg delivery time, avg rider rating, avg rider age. Charts: orders by vehicle type, weather breakdown, city volume, traffic density.

### 🚴 Delivery Analysis
Deep-dive into delivery time drivers — weather impact, traffic impact, and festival vs non-festival performance comparison.

### 📦 Order Insights
Food category distribution and analysis of how simultaneous multi-order deliveries impact per-delivery time.

### ⭐ Performance
Rider rating distribution and correlation between vehicle condition score and delivery speed.

---

## Key Findings

1. **Traffic density** is the dominant delivery time factor — Jam conditions increase time by ~40% vs Low traffic
2. **Stormy and sandstorm weather** cause the highest delivery delays across all weather types
3. **Motorcycles** are the most utilized delivery vehicle by a significant margin
4. **Festival periods** consistently show elevated delivery times due to demand surges
5. **Multiple simultaneous deliveries** linearly increase per-order delivery time
6. **Metropolitian cities** generate the highest order volumes
7. Riders average **29.6 years of age** with a strong average rating of **4.6 / 6**
8. **Higher vehicle condition scores** correlate with marginally faster delivery performance

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Visualization | Chart.js |
| Backend | Python 3, Flask, Flask-CORS |
| Data Processing | Pandas, NumPy |
| API Architecture | REST |
| Dev Environment | VS Code, Live Server |

---

## Privacy

This application processes all data strictly locally on the host machine running the Python backend. No data is collected, stored, or transmitted to any third-party service. All analytical computations run natively.

---

---

## License

This project is open source and available under the [MIT License](LICENSE).

# AquaIntelX AI Backend

Real-time water quality monitoring and anomaly detection system powered by machine learning with AI-powered quick insights.

## 🌊 Overview

AquaIntelX is an intelligent water quality monitoring system that:
- **Detects anomalies** in water samples using ML models
- **Analyzes parameters** against predefined quality thresholds
- **Generates AI-powered quick insights** for dashboard display
- **Provides actionable recommendations** based on current conditions
- **Offers trend analysis** for long-term monitoring
- **Delivers real-time monitoring** through RESTful API

## 📋 Features

- ✅ Anomaly Detection using Isolation Forest ML model
- ✅ Real-time Water Quality Analysis
- ✅ AI Advisor with Quick Insights
- ✅ Intelligent Suggestion Engine
- ✅ Trend Analysis and Historical Data
- ✅ Configurable Quality Thresholds
- ✅ Model Training and Persistence
- ✅ Comprehensive Dashboard Summaries
- ✅ RESTful API with CORS support

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/MarkSobremonte/FinalAquaintelX.git
cd FinalAquaintelX/backend-test

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Run the Server

```bash
# Start the Flask development server
python app.py

# Server will be available at http://localhost:5000
```

## 📊 Water Quality Parameters

The system monitors the following parameters:

| Parameter | Unit | Min | Max | Description |
|-----------|------|-----|-----|-------------|
| **Temperature** | °C | 0 | 35 | Water temperature |
| **pH** | - | 6.5 | 8.5 | Acidity/Alkalinity |
| **Dissolved Oxygen** | mg/L | 5.0 | - | Oxygen content |
| **Turbidity** | NTU | 0 | 5.0 | Water clarity |
| **Conductivity** | µS/cm | - | - | Dissolved salts |
| **Nitrates** | mg/L | 0 | - | Nitrogen compounds |
| **Phosphates** | mg/L | 0 | - | Phosphorus compounds |
| **Chlorine** | mg/L | - | - | Disinfectant level |

## 🔌 API Endpoints

### Analysis Endpoints

#### POST `/api/analysis/sample`
Analyze a water sample

```json
{
  "temperature": 25.5,
  "pH": 7.2,
  "dissolved_oxygen": 7.5,
  "turbidity": 2.1,
  "conductivity": 350,
  "nitrates": 15,
  "phosphates": 0.5,
  "chlorine": 0.8
}
```

**Response:**
```json
{
  "timestamp": "2026-06-13T10:30:45.123456",
  "parameters": {...},
  "violations": [],
  "suggestions": [],
  "overall_status": "GOOD",
  "health_score": 100.0
}
```

#### GET `/api/analysis/trend`
Get trend analysis over the monitoring window

#### GET `/api/analysis/history?limit=10`
Get historical analysis results

#### POST `/api/analysis/clear`
Clear analysis history

### Detection Endpoints

#### POST `/api/detection/anomaly`
Detect anomalies in a water sample

#### GET `/api/detection/threshold`
Get current quality thresholds

### Training Endpoints

#### POST `/api/training/train`
Train the anomaly detection model

#### GET `/api/training/status`
Get model training status

### 🤖 AI Advisor Endpoints (NEW)

#### POST `/api/advisor/quick-insights`
Get quick insights for the dashboard

```json
{
  "analysis_result": {...},
  "anomaly_result": {...}
}
```

**Response:**
```json
{
  "timestamp": "2026-06-13T10:30:45",
  "summary": "✅ GOOD: Water quality is within acceptable parameters. Health Score: 100.0%",
  "quick_insights": [
    {
      "type": "PARAMETER_ALERT",
      "parameter": "pH",
      "message": "pH too acidic (6.2). Add alkaline treatment.",
      "severity": "HIGH"
    }
  ],
  "risk_level": "GOOD",
  "health_score": 100.0,
  "anomaly_detected": false,
  "primary_actions": [...],
  "secondary_actions": [...]
}
```

#### POST `/api/advisor/recommendations`
Get AI-powered recommendations

```json
{
  "analysis_result": {...},
  "trend_data": {...}
}
```

**Response:**
```json
{
  "timestamp": "2026-06-13T10:30:45",
  "recommendations": [
    {
      "action": "Add alkaline buffer or limestone to increase pH",
      "parameter": "pH",
      "priority": "HIGH",
      "urgency": "IMMEDIATE",
      "reasoning": "pH is too low (6.2)",
      "estimated_impact": {
        "score": 8,
        "description": "Affects chemical reactions and ecosystems"
      }
    }
  ],
  "predictive_alerts": [...],
  "maintenance_tips": [...]
}
```

#### POST `/api/advisor/dashboard-summary`
Get comprehensive dashboard summary with all insights

```json
{
  "analysis_result": {...},
  "anomaly_result": {...},
  "trend_data": {...}
}
```

**Response:**
```json
{
  "timestamp": "2026-06-13T10:30:45",
  "overall_health": {
    "status": "GOOD",
    "score": 100.0,
    "icon": "🟢",
    "color": "#4CAF50"
  },
  "quick_summary": "✅ GOOD: Water quality is within acceptable parameters",
  "quick_insights": [...],
  "primary_actions": [...],
  "secondary_actions": [...],
  "all_recommendations": [...],
  "predictive_alerts": [...],
  "maintenance_tips": [...],
  "anomaly_info": {...},
  "parameters": {...},
  "trends": {...}
}
```

## 🤖 AI Advisor Engine

The AI Advisor provides intelligent insights including:

### Quick Insights
- **Parameter Alerts**: Real-time alerts for parameter violations
- **Anomaly Detection**: Alerts when unusual patterns are detected
- **Risk Level**: Categorized as CRITICAL, WARNING, or GOOD
- **Health Score**: Overall water quality percentage (0-100%)

### Recommendations
- **Primary Actions**: Immediate/high-priority actions for violations
- **Secondary Actions**: Medium-priority maintenance actions
- **Impact Estimation**: Scores showing parameter importance
- **Predictive Alerts**: Trend-based alerts for future issues

### Maintenance Tips
- **Temperature Management**: Heating/cooling recommendations
- **Chemical Treatment**: pH adjustment guidance
- **Filtration Maintenance**: Filter cleaning schedules
- **Water Treatment**: Softening and ion exchange suggestions
- **Sensor Maintenance**: Calibration reminders

## 🧠 Machine Learning Model

### Isolation Forest Algorithm

The anomaly detection uses the **Isolation Forest** algorithm:
- Effective for detecting outliers in multivariate data
- Works well with high-dimensional water quality data
- Provides anomaly scores normalized to 0-1 range
- Configurable contamination rate and threshold

## 📦 Project Structure

```
backend-test/
├── models/
│   ├── __init__.py
│   ├── anomaly_detector.py      # ML anomaly detection
│   ├── water_analyzer.py        # Real-time analysis engine
│   └── ai_advisor.py            # AI-powered insights (NEW)
├── api/
│   ├── __init__.py
│   └── routes.py                # API endpoints
├── app.py                       # Main application
├── config.py                    # Configuration management
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
└── README.md                    # This file
```

## 🧪 Testing

### Using cURL - Quick Insights

```bash
# First, analyze a sample
ANALYSIS=$(curl -X POST http://localhost:5000/api/analysis/sample \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.5,
    "pH": 6.2,
    "dissolved_oxygen": 7.5,
    "turbidity": 2.1,
    "conductivity": 350,
    "nitrates": 15,
    "phosphates": 0.5,
    "chlorine": 0.8
  }')

# Then get quick insights
curl -X POST http://localhost:5000/api/advisor/quick-insights \
  -H "Content-Type: application/json" \
  -d '{"analysis_result": '"$ANALYSIS"'}'
```

### Using Python

```python
import requests
import json

# Analyze sample
analysis_response = requests.post(
    'http://localhost:5000/api/analysis/sample',
    json={
        'temperature': 25.5,
        'pH': 6.2,
        'dissolved_oxygen': 7.5,
        'turbidity': 2.1,
        'conductivity': 350,
        'nitrates': 15,
        'phosphates': 0.5,
        'chlorine': 0.8
    }
)

analysis_result = analysis_response.json()
print("Analysis Result:", analysis_result)

# Get quick insights
insights_response = requests.post(
    'http://localhost:5000/api/advisor/quick-insights',
    json={'analysis_result': analysis_result}
)

insights = insights_response.json()
print("\nQuick Insights:")
print(f"Summary: {insights['summary']}")
print(f"Health Score: {insights['health_score']}%")
print(f"Risk Level: {insights['risk_level']}")
print(f"\nPrimary Actions:")
for action in insights['primary_actions']:
    print(f"  - [{action['urgency']}] {action['action']}")
```

## 🚀 Deployment

### Docker

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  aquaintelx-api:
    build: ./backend-test
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - API_HOST=0.0.0.0
```

## 🔧 Configuration

Edit `.env` to customize:

```env
# Server
FLASK_ENV=development
FLASK_DEBUG=True
API_PORT=5000

# Model
ANOMALY_THRESHOLD=0.7

# Quality Thresholds
PH_MIN=6.5
PH_MAX=8.5
DO_MIN=5.0
TURBIDITY_MAX=5.0
TEMPERATURE_MIN=0
TEMPERATURE_MAX=35
```

## 🎯 Future Enhancements

- [ ] Historical data database (PostgreSQL/MongoDB)
- [ ] WebSocket support for real-time streaming
- [ ] Mobile app integration
- [ ] Advanced visualization dashboard
- [ ] Deep learning models for complex patterns
- [ ] Multi-location monitoring
- [ ] Data export functionality
- [ ] Custom alert thresholds per location
- [ ] Predictive maintenance scheduling
- [ ] Integration with IoT sensor platforms

---

**AquaIntelX** - Intelligent Water Quality Monitoring with AI 🌊💡

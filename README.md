# Short-Term Electricity Demand Forecasting for India

A time-series forecasting system for predicting short-term electricity demand in India using historical electricity demand, calendar features, and weather information.

The project is being developed as a multi-model forecasting system using:

- XGBoost
- LSTM
- Transformer

The current repository contains the verified dataset pipeline, preprocessing scripts, frontend dashboard, and a locally trained LSTM forecasting pipeline.

---

## Project Status

### Completed

- Dataset inspection and preprocessing
- 15-minute time-series verification
- Train/validation/test split
- Weather feature integration
- Calendar and cyclical time features
- LSTM sequence preparation
- LSTM model training
- LSTM test evaluation
- LSTM model artifact generation
- React/Next.js frontend dashboard
- GitHub repository integration

### In Progress

- Transformer model
- XGBoost model
- Common model comparison
- SHAP explainability
- FastAPI inference backend
- Frontend-to-backend integration

---

# Project Architecture

```text
Dataset
   ↓
Data Preprocessing
   ↓
Feature Engineering
   ↓
Time-Series Preparation
   ↓
┌───────────────┬───────────────┬───────────────┐
│    XGBoost    │     LSTM      │  Transformer   │
└───────────────┴───────────────┴───────────────┘
                       ↓
                Model Evaluation
                       ↓
                 SHAP Explainability
                       ↓
                 Saved Artifacts
                       ↓
                  FastAPI Backend
                       ↓
                    REST API
                       ↓
              React / Next.js Frontend
                       ↓
               Forecast Dashboard

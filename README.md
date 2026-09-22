# 🧠 HabitMind AI

**HabitMind AI** is a full-stack habit management and personal productivity platform that combines **habit tracking, streak analysis, 90-day activity visualization, and AI-powered behavioral insights** to help users understand and improve their daily routines.

The application uses a **React + Vite frontend**, **Node.js + Express REST API**, **MongoDB Atlas**, and **Google Gemini AI**.

---

## 📌 Project Highlights

| Metric                        | Implementation                                                  |
| ----------------------------- | --------------------------------------------------------------- |
| 📅 **90 Days**                | Historical habit activity tracking                              |
| 🤖 **5+ AI Capabilities**     | Suggestions, reports, insights, assistant & recovery            |
| 📊 **Multiple Analytics**     | Completion rate, current streak, best streak & activity history |
| 🔐 **JWT Authentication**     | Protected user-specific APIs                                    |
| ⚡ **REST API**                | Modular Express backend                                         |
| 🗄️ **MongoDB Atlas**         | Persistent cloud database                                       |
| 🎯 **User-Specific Insights** | AI context generated from tracked habit data                    |

---

## 🚀 Overview

Most habit trackers focus primarily on recording whether a habit was completed.

HabitMind AI adds an intelligence layer on top of habit tracking.

It records daily activity, calculates performance metrics, visualizes historical behavior, and uses AI to generate personalized insights from the user's actual habit data.

The system helps answer questions such as:

```text
How consistent am I?

Which habits need more attention?

Why am I struggling with a particular habit?

How has my performance changed?

What should I focus on next?
```

---

# ✨ Core Features

## 🔐 1. Authentication & Authorization

* User registration and login
* JWT-based authentication
* bcrypt password hashing
* Protected API routes
* Persistent authentication
* User-specific data isolation
* Automatic unauthorized-session handling

### Authentication Flow

```text
Register
   ↓
Password Hashing
   ↓
MongoDB
   ↓
Login
   ↓
JWT Token
   ↓
Authenticated Requests
   ↓
Protected APIs
```

---

## ✅ 2. Habit Management

Users can manage their complete habit lifecycle:

* Create habits
* Edit habits
* Archive habits
* Delete habits
* Categorize habits
* Define targets
* Add descriptions
* Track daily completion

Each habit belongs to the authenticated user.

---

## 📅 3. Daily Habit Tracking

The dashboard provides a centralized daily tracking system.

Users can:

* View today's habits
* Mark habits as completed
* Undo completions
* Monitor daily progress
* Track current streaks
* Review recent activity

Habit completion is stored as persistent log data and can later be used for analytics and AI processing.

---

# 🔥 4. Streak Analysis

HabitMind calculates multiple consistency metrics:

* Current streak
* Longest streak
* Completion rate
* Historical streak patterns
* Streak recovery opportunities

The system can detect when a user breaks an established streak and provide a recovery recommendation.

---

# 📊 5. Statistics Dashboard

The Statistics dashboard converts raw habit logs into meaningful metrics.

It includes:

* Habit completion percentage
* Current streak
* Best streak
* Weekly performance
* Habit-wise statistics
* Historical activity
* 90-day completion data
* Heatmap visualization

This gives users both **short-term and long-term visibility** into their habits.

---

# 🗓️ 6. 90-Day Activity Heatmap

HabitMind stores and visualizes up to **90 days of habit activity**.

The heatmap helps identify:

* Consistent periods
* Inactive periods
* Completion patterns
* Habit-building trends
* Gaps in consistency

```text
Past 90 Days
─────────────────────────────────────────────►
██ ░░ ███ ░ ████ ░░ ██ ███ ░ █████ ░░
Low Activity        Consistent        High Activity
```

---

# 🤖 7. AI-Powered Habit Intelligence

HabitMind AI integrates **Google Gemini** to analyze habit-related data and provide personalized assistance.

The platform currently supports **5+ AI-oriented capabilities**:

### 1. AI Habit Suggestions

Suggests potential habits based on the user's existing routine and activity.

### 2. AI Weekly Report

Generates a personalized summary of recent habit performance.

### 3. AI Habit Insights

Analyzes consistency, missed days, streaks, and completion patterns.

### 4. AI Assistant

Allows users to ask natural-language questions about their habit performance.

Example:

```text
Why am I struggling with my exercise habit?

Which habit am I most consistent with?

Why did my streak break?

Which habit should I focus on?

How has my reading habit performed?
```

### 5. Streak Recovery Suggestions

Provides actionable suggestions after a significant streak is broken.

---

# 🧠 AI Processing Architecture

The AI assistant is not designed as a standalone generic chatbot.

Before generating a response, the backend retrieves relevant user data and builds a structured context.

```text
User Question
      │
      ▼
AI API Endpoint
      │
      ▼
Authenticate User
      │
      ▼
Retrieve Habit Data
      │
      ▼
Calculate Relevant Metrics
      │
      ▼
Build AI Context
      │
      ▼
Google Gemini
      │
      ▼
Personalized Response
```

This allows the AI layer to work with the user's actual tracked activity.

---

# 💡 8. Habit Recovery System

HabitMind includes a recovery mechanism designed to help users restart after breaking a streak.

```text
7+ Day Streak
      ↓
Habit Missed
      ↓
Streak = 0
      ↓
Recovery Detection
      ↓
Recovery Suggestion
      ↓
Restart Habit
```

The goal is to shift the experience from:

```text
"I broke my streak → I failed"
```

towards:

```text
"I broke my streak → I can restart"
```

---

# 🌅 9. Personalized Dashboard

The dashboard combines multiple productivity components into one interface.

Current dashboard modules include:

* Today's Habit Card
* Weekly Habit Grid
* Progress Indicators
* Summary Cards
* Heatmap
* AI Weekly Report
* Morning Motivation
* Habit Suggestions
* Streak Recovery

This provides a single workspace for daily habit management and long-term progress analysis.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │       USER        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  React + Vite     │
                         │     Frontend      │
                         └─────────┬─────────┘
                                   │
                              REST API
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Node.js + Express │
                         │      Backend      │
                         └─────────┬─────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
          ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
          │    Auth     │   │   Habits    │  │     AI      │
          │   Service   │   │   Service   │  │   Service   │
          └─────────────┘   └──────┬──────┘  └──────┬──────┘
                                   │                │
                                   ▼                ▼
                            ┌─────────────┐  ┌─────────────┐
                            │  MongoDB    │  │ Gemini API  │
                            │    Atlas    │  │             │
                            └─────────────┘  └─────────────┘
```

---

# 🧩 Technical Architecture

## Frontend

The frontend is responsible for:

* UI rendering
* Client-side routing
* Authentication state
* API communication
* Habit interaction
* Data visualization
* AI interaction

API communication is centralized using Axios.

```javascript
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});
```

This allows the same application to work across local and production environments.

---

## Backend

The Express backend provides REST APIs for:

* Authentication
* Habit management
* Habit logs
* Statistics
* Heatmap data
* AI suggestions
* AI reports
* AI insights
* AI assistant
* Recovery recommendations

Authentication middleware protects user-specific endpoints.

---

## Database

MongoDB Atlas stores persistent application data.

Logical data relationship:

```text
User
 │
 ├── Habits
 │     │
 │     └── Habit Logs
 │
 └── AI Insights
```

---

# 📁 Project Structure

```text
HabitMind_AI/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🛠️ Technology Stack

| Layer             | Technology        |
| ----------------- | ----------------- |
| Frontend          | React.js          |
| Build Tool        | Vite              |
| Language          | JavaScript        |
| Styling           | Tailwind CSS      |
| Routing           | React Router      |
| HTTP Client       | Axios             |
| Charts            | Recharts          |
| Animation         | Framer Motion     |
| Icons             | Lucide React      |
| Backend           | Node.js           |
| API Framework     | Express.js        |
| Database          | MongoDB           |
| ODM               | Mongoose          |
| Authentication    | JWT               |
| Password Security | bcrypt            |
| AI                | Google Gemini API |
| Database Hosting  | MongoDB Atlas     |
| Deployment        | Render            |
| Version Control   | Git + GitHub      |

---

# 🔑 Environment Variables

## Backend

Create:

```text
backend/.env
```

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

## Frontend

Create:

```text
frontend/.env
```

```env
VITE_API_URL=http://localhost:8000/api
```

### Production Frontend

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### Production Backend

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=https://your-frontend.onrender.com
```

> Never commit `.env` files, API keys, database credentials, or JWT secrets to GitHub.

---

# ⚙️ Local Setup

## Prerequisites

* Node.js
* npm
* Git
* MongoDB Atlas account
* Google Gemini API key

---

## 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/HabitMind_AI.git
cd HabitMind_AI
```

---

## 2. Backend

```bash
cd backend
npm install
```

Configure:

```text
backend/.env
```

Start:

```bash
npm run dev
```

Backend:

```text
http://localhost:8000
```

---

## 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure:

```text
frontend/.env
```

Start:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production output is generated in:

```text
frontend/dist/
```

`dist/` is generated during deployment and should not be committed to Git.

---

# ☁️ Deployment Architecture

HabitMind AI is designed for independent frontend and backend deployment.

```text
                    GitHub
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
      Render Static Site   Render Web Service
          Frontend             Backend
             │                 │
             │                 ▼
             │            MongoDB Atlas
             │
             └──── REST API ─────►
```

### Frontend

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required environment variables:

```env
MONGODB_URI=...
JWT_SECRET=...
GEMINI_API_KEY=...
CLIENT_URL=...
```

---

# 🔐 Security

The application implements several security practices:

* JWT-based authentication
* bcrypt password hashing
* Protected API routes
* User-specific database queries
* Environment-based secret management
* CORS configuration
* No API credentials in source control
* Centralized authentication handling

---

# 📊 Data Flow

```text
Create Habit
     ↓
Habit Stored
     ↓
Daily Completion
     ↓
Habit Log
     ↓
Statistics Calculation
     ↓
Dashboard Visualization
     ↓
AI Context Generation
     ↓
Personalized Insight
```

---

# 📈 Project Metrics

HabitMind AI currently provides:

```text
90 Days
└── Historical activity tracking

5+ AI Capabilities
└── Suggestions
└── Weekly reports
└── Habit insights
└── AI assistant
└── Streak recovery

Multiple Analytics
└── Completion rate
└── Current streak
└── Best streak
└── Weekly performance
└── Historical activity

Full-Stack Architecture
└── React
└── Express
└── MongoDB
└── Gemini AI
```

These metrics describe the **implemented functionality and system scope**, rather than claiming artificial user-growth or performance numbers.

---

# 🔮 Future Enhancements

* Push notifications
* Email reminders
* Calendar integration
* Mobile application
* Advanced habit pattern detection
* Personalized goal generation
* Achievement and reward system
* Improved AI conversation memory
* Social accountability
* Advanced monthly/yearly analytics
* Personalized productivity recommendations

---

# 🎯 Project Objective

HabitMind AI is built around a simple idea:

> **Habit tracking should not stop at recording completion. It should help users understand their behavior.**

The system combines:

**Tracking → Analytics → Visualization → AI → Actionable Insights**

to create a more intelligent approach to personal habit management.

---

# 👨‍💻 Author

**Janhavi Patil**

---

# 📄 License

This project is developed for educational, portfolio, and learning purposes.

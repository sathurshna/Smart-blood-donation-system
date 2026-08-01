# 🩸 Emergency Blood Donation & Matching System

An AI-powered, real-time blood donor matching web platform designed to eliminate delay when hospitals urgently need blood. The platform connects hospitals directly with nearby, eligible donors using intelligent prioritization and geolocation.

---

## ⚡ Problem Statement

During medical emergencies, hospitals face severe bottlenecks:

- **Visibility:** People don't know _who_ needs blood or _where_.
- **Proximity:** Hospitals struggle to locate available donors _nearby_.
- **Screening:** Donors often don't know if they meet safety and time-based _eligibility criteria_.

---

## 💡 The Solution

A unified emergency network where:

1. **Hospitals** broadcast urgent blood requirements.
2. **Donors** register their blood type, location, and donation history.
3. **Smart Matching** pairs hospitals with the closest eligible donors automatically.
4. **AI Assistance** extracts, summarizes, and prioritizes life-threatening requests.

---

## 🚀 Key Features

- **🤖 AI Request Summarizer & Prioritization:** Leverages Google Gemini to instantly digest complex medical context from requests, highlighting criticality and prioritizing high-urgency cases.
- **📍 Distance-Based Donor Matching:** Integrates mapping services to dynamically calculate spatial proximity and notify nearby donors.
- **📋 Smart Eligibility Checker:** Automated eligibility verification based on past donation dates, health conditions, and interval guidelines.
- **📊 Blood Inventory Dashboard:** Real-time visibility into current hospital stock levels and active demand.
- **🚨 Emergency Notification Dispatch:** Automated alert pipeline to push immediate requests to matching local donors.

---

## 🛠 Tech Stack

| Domain                 | Technology           |
| :--------------------- | :------------------- |
| **Frontend**           | React                |
| **Backend**            | Express.js (Node.js) |
| **Database**           | PostgreSQL           |
| **Mapping & Location** | Google Maps Platform |
| **AI Engine**          | Google Gemini API    |

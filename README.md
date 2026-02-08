# TK Scanner App

Event attendance scanning application with separate frontend (mobile) and backend.

## Project Structure

- **mobile/**: React Native (Expo) application for Android/iOS.
- **backend/**: Express + MongoDB API server.

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3000
```

### 2. Mobile App Setup

```bash
cd mobile
npm install
npx expo start -c
```

**If the QR Code does not appear:**
- Open the **Expo Go** app on your phone.
- Manually enter the URL: `exp://<your-local-ip>:8081`
  - Example: `exp://192.168.29.170:8081`
- Ensure your phone and computer are on the same Wi-Fi network.

## Configuration

- **Backend**: Rename `backend/.env.example` to `backend/.env` and update MongoDB URL.
- **Mobile**: Update `mobile/.env` with your backend URL (use local IP for physical devices).

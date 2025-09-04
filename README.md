# AthleteSync 💪

A React Native mobile application that bridges the gap between athletes and their support partners through real-time health monitoring and training coordination.

## 🌟 Features

### For Athletes 🏃‍♂️
- **📅 Daily Schedule Management** - Create and track training schedules with intuitive date/time pickers
- **😊 Mood Logging** - Track daily emotional state with emoji and personal notes
- **✅ Task Completion** - Mark training sessions as complete with celebratory feedback
- **🔄 Real-time Sync** - All data syncs instantly with partner dashboard

### For Partners 💕
- **📊 Real-time Monitoring** - View athlete's daily activities and schedules
- **💝 Mood Tracking** - Monitor athlete's emotional well-being and patterns
- **📈 Progress Overview** - See completion rates and training statistics
- **📱 Live Activity Feed** - Real-time updates on athlete's training activities

## 🏗️ Struktur Project

```
calorie-tracker-app/
├── backend/                 # Node.js Express API
│   ├── routes/             # API routes
│   ├── db.js              # Database configuration
│   ├── server.js          # Main server file
│   └── .env.example       # Environment variables example
└── frontend/              # React Native App
    └── CalorieTracker/    # Main React Native project
        ├── screens/       # App screens
        ├── components/    # Reusable components
        ├── android/       # Android specific files
        ├── ios/          # iOS specific files
        └── .env.example  # Environment variables example
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 atau lebih tinggi)
- npm atau yarn
- React Native CLI
- Android Studio (untuk development Android)
- Xcode (untuk development iOS, hanya di macOS)
- SQL Server atau SQL Server Express LocalDB

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd calorie-tracker-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy dan edit environment variables
   copy .env.example .env
   # Edit .env dengan kredensial database Anda
   ```

3. **Setup Database**
   - Pastikan SQL Server sudah running
   - Update kredensial database di file `.env`
   - Database dan table akan dibuat otomatis saat server pertama kali dijalankan

4. **Setup Frontend**
   ```bash
   cd ../frontend/CalorieTracker
   npm install
   
   # Copy dan edit environment variables
   copy .env.example .env
   # Edit .env dengan URL backend Anda
   ```

5. **Install Dependencies untuk React Native**
   
   **Android:**
   ```bash
   npx react-native run-android
   ```
   
   **iOS (hanya macOS):**
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios
   ```

## 🔧 Configuration

### Backend Environment Variables

Buat file `.env` di folder `backend/` dengan template dari `.env.example`:

```env
PORT=3000
DB_SERVER=localhost
DB_DATABASE=calorie_tracker_db
DB_USER=your_db_username
DB_PASSWORD=your_db_password
```

### Frontend Environment Variables

Buat file `.env` di folder `frontend/CalorieTracker/` dengan template dari `.env.example`:

```env
API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 🚦 Running the Application

### Start Backend Server

```bash
cd backend
node server.js
```

Server akan berjalan di `http://localhost:3000`

### Start Frontend Development

**Terminal 1 - Metro Bundler:**
```bash
cd frontend/CalorieTracker
npm start
```

**Terminal 2 - Android:**
```bash
cd frontend/CalorieTracker
npm run android
```

**Terminal 2 - iOS (macOS only):**
```bash
cd frontend/CalorieTracker
npm run ios
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Mood Tracking
- `POST /api/mood` - Submit mood data
- `GET /api/mood/:userId` - Get user mood history

### Schedule Management
- `POST /api/schedule` - Create schedule
- `GET /api/schedule/:userId` - Get user schedules

## 🛠️ Development

### Backend Structure
- `server.js` - Main server dan middleware setup
- `db.js` - Database connection dan configuration
- `routes/auth.js` - Authentication endpoints
- `routes/mood.js` - Mood tracking endpoints
- `routes/schedule.js` - Schedule management endpoints

### Frontend Structure
- `App.js` - Main app component dengan navigation
- `screens/` - Semua screen components
  - `LoginScreen.js` - Login interface
  - `RegisterScreen.js` - Registration interface
  - `DashboardScreen.js` - Main dashboard
  - `AthleteDashboard.js` - Athlete-specific dashboard
  - `PartnerDashboard.js` - Partner-specific dashboard
  - `SimpleScheduleScreen.js` - Schedule management
- `components/` - Reusable components
  - `CustomModal.js` - Custom modal component
  - `MoodCheckModal.js` - Mood tracking modal

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Pastikan SQL Server sudah running
   - Verifikasi kredensial di file `.env`
   - Check apakah port sudah benar

2. **Metro Bundler Issues**
   ```bash
   cd frontend/CalorieTracker
   npx react-native start --reset-cache
   ```

3. **Android Build Issues**
   ```bash
   cd frontend/CalorieTracker/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

4. **iOS Build Issues (macOS)**
   ```bash
   cd frontend/CalorieTracker/ios
   pod install --repo-update
   cd ..
   npx react-native run-ios
   ```

## 📝 Scripts Available

### Backend
```bash
npm start        # Start server dengan node
npm run dev      # Start server dengan nodemon (jika tersedia)
```

### Frontend
```bash
npm start        # Start Metro bundler
npm run android  # Run pada Android emulator/device
npm run ios      # Run pada iOS simulator (macOS only)
npm test         # Run tests
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Calorie Tracking Mobile Application
- **Tech Stack**: Node.js, Express, React Native, SQL Server

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository ini.
=======
# AthleteSync
A React Native mobile app that connects athletes with their partners for real-time health monitoring, mood tracking, and training schedule management. Features include schedule sync, mood logs, and partner dashboard.
>>>>>>> f4a24f4cee05a4f1362866f94c69846974984b64

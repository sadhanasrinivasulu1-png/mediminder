import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReminderProvider } from './context/ReminderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ReminderModal from './components/ReminderModal';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddMedicinePage from './pages/AddMedicinePage';
import MedicineSchedulePage from './pages/MedicineSchedulePage';
import ReminderHistoryPage from './pages/ReminderHistoryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ReminderProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedules"
                  element={
                    <ProtectedRoute>
                      <MedicineSchedulePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-medicine"
                  element={
                    <ProtectedRoute>
                      <AddMedicinePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <ReminderHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />

            {/* Global Real-time Reminder Pop-up */}
            <ReminderModal />
          </div>
        </ReminderProvider>
      </AuthProvider>
    </Router>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Route Guards
import { AdminRoute } from './routes/AdminRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { StoriesPage } from './pages/public/StoriesPage';
import { StoryReaderPage } from './pages/public/StoryReaderPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { FavoritesPage } from './pages/public/FavoritesPage';
import { ProfilePage } from './pages/public/ProfilePage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ManageStoriesPage } from './pages/admin/ManageStoriesPage';
import { StoryBuilderPage } from './pages/admin/StoryBuilderPage';
import { ManageCategoriesPage } from './pages/admin/ManageCategoriesPage';
import { ManageQuizzesPage } from './pages/admin/ManageQuizzesPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { ManageAchievementsPage } from './pages/admin/ManageAchievementsPage';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

import { StoryEditorPage } from './pages/admin/StoryEditorPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC WEBSITE ROUTES (Zero Admin UI/Buttons) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/story/:slug" element={<StoryReaderPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* DEDICATED ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* PROTECTED ADMIN DASHBOARD APP (/admin/*) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/stories" element={<ManageStoriesPage />} />
            <Route path="/admin/stories/:id/edit" element={<StoryEditorPage />} />
            <Route path="/admin/editor" element={<StoryEditorPage />} />
            <Route path="/admin/editor/:id" element={<StoryEditorPage />} />
            <Route path="/admin/builder" element={<StoryBuilderPage />} />
            <Route path="/admin/categories" element={<ManageCategoriesPage />} />
            <Route path="/admin/quizzes" element={<ManageQuizzesPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/achievements" element={<ManageAchievementsPage />} />
            <Route path="/admin/media" element={<MediaLibraryPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        {/* ALIAS REDIRECTS FOR ADMIN PATHS */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

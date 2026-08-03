import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Forbidden403Page } from '../pages/admin/Forbidden403Page';

export const AdminRoute: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <span className="text-sm font-bold">جاري التحقق من صلاحيات المشرف...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to /admin/login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but NOT an admin -> Show 403 Forbidden Page
  if (!isAdmin) {
    return <Forbidden403Page />;
  }

  // Authorized Admin -> Render admin child routes
  return <Outlet />;
};

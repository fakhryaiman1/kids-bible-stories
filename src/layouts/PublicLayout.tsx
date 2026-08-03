import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { AuthModal } from '../components/AuthModal';

export const PublicLayout: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/60 via-sky-50/80 to-indigo-50/60 text-slate-800 font-['Cairo',sans-serif]">
      <PublicNavbar onOpenAuth={() => setAuthModalOpen(true)} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">
        <Outlet context={{ onOpenAuth: () => setAuthModalOpen(true) }} />
      </main>

      <PublicFooter />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

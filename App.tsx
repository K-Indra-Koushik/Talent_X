
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import InternshipsPage from './pages/InternshipsPage';
import ServicesPage from './pages/ServicesPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { NavLinkItem } from './types';
import { NAV_LINKS } from './constants';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navLinks: NavLinkItem[] = NAV_LINKS;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-gray-100">
        <Navbar navLinks={navLinks} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/internships" element={<InternshipsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/profile" /> : <AuthPage />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
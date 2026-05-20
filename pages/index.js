import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useChatApp } from '../context/ChatAppContext';
import Layout from '../components/Layout';
import Welcome from '../components/Welcome';
import FriendsList from '../components/FriendsList';
import ChatWindow from '../components/ChatWindow';
import UserProfile from '../components/UserProfile';
import AdminDashboard from '../components/AdminDashboard';
import Loader from '../components/Loader';
import { FiUser, FiShield } from 'react-icons/fi';

export default function Home() {
  const { publicKey } = useWallet();
  const { currentUser, loading, appState } = useChatApp();
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = appState && publicKey && appState.owner.toString() === publicKey.toString();

  // Show welcome screen if wallet not connected or user account not created
  if (!publicKey || !currentUser) {
    return (
      <Layout>
        <Welcome />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] flex">
        {/* Sidebar - Friends List */}
        <div className={`
          w-full md:w-80 lg:w-96 border-r border-gray-700 bg-[var(--bg-secondary)]
          ${isMobileMenuOpen ? 'block' : 'hidden md:block'}
        `}>
          <FriendsList />
        </div>

        {/* Main Chat Area */}
        <div className={`
          flex-1 bg-[var(--bg-primary)]
          ${isMobileMenuOpen ? 'hidden md:block' : 'block'}
        `}>
          <ChatWindow />
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          {/* Profile Button */}
          <button
            onClick={() => setShowProfile(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
            title="Profile"
          >
            <FiUser className="text-white text-xl" />
          </button>

          {/* Admin Button (only visible to admin) */}
          {isAdmin && (
            <button
              onClick={() => setShowAdmin(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
              title="Admin Dashboard"
            >
              <FiShield className="text-white text-xl" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center shadow-lg"
            title="Toggle Menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      {showAdmin && (
        <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
          <div className="w-full h-full overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAdmin(false)}
              className="fixed top-4 right-4 z-50 btn btn-secondary"
            >
              Close
            </button>
            <AdminDashboard />
          </div>
        </div>
      )}

      {/* Global Loader */}
      {loading && <Loader message="Processing..." />}
    </Layout>
  );
}

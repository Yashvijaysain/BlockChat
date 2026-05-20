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
import { FiMenu, FiShield, FiUser, FiX } from 'react-icons/fi';

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
      <div className="relative flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-primary)]">
        <div className={`
          w-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] md:block md:w-[340px] lg:w-[380px]
          ${isMobileMenuOpen ? 'block' : 'hidden md:block'}
        `}>
          <FriendsList />
        </div>

        <div className={`
          min-w-0 flex-1 bg-[var(--bg-primary)]
          ${isMobileMenuOpen ? 'hidden md:block' : 'block'}
        `}>
          <ChatWindow />
        </div>

        <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2">
          <button
            onClick={() => setShowProfile(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shadow-lg shadow-black/20 hover:bg-[var(--bg-hover)] hover:text-white"
            title="Profile"
          >
            <FiUser className="text-lg" />
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAdmin(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/12 text-yellow-200 shadow-lg shadow-black/20 hover:bg-yellow-500/20"
              title="Admin Dashboard"
            >
              <FiShield className="text-lg" />
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-[#07130f] shadow-lg shadow-black/20 md:hidden"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
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

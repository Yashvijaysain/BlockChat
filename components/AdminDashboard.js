import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useChatApp } from '../context/ChatAppContext';
import { shortenAddress, getAddressExplorerUrl } from '../utils/helpers';
import { FiShield, FiUsers, FiCheckCircle, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { publicKey } = useWallet();
  const { appState, initializeProgram, allUsers, loading, fetchAppState } = useChatApp();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (appState && publicKey) {
      setIsAdmin(appState.owner.toString() === publicKey.toString());
    } else {
      setIsAdmin(false);
    }
  }, [appState, publicKey]);

  const handleInitialize = async () => {
    const result = await initializeProgram();
    if (result) {
      toast.success('Program initialized successfully!');
    }
  };

  const handleRefresh = async () => {
    await fetchAppState();
    toast.success('Data refreshed!');
  };

  // If app is not initialized
  if (!appState) {
    return (
      <div className="modal-overlay">
        <div className="modal-content max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-4xl text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Program Not Initialized</h2>
            <p className="text-gray-400 mb-6">
              The chat program needs to be initialized before it can be used.
              Only the program owner can perform this action.
            </p>

            <button
              onClick={handleInitialize}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Initializing...' : 'Initialize Program'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FiShield className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Program Management</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary"
          >
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <FiUsers className="text-3xl text-indigo-400" />
              <span className="badge badge-success">Active</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {appState.totalUsers?.toString() || '0'}
            </div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>

          {/* Program Owner */}
          <div className="card col-span-2">
            <div className="flex items-center space-x-3 mb-2">
              <FiShield className="text-2xl text-purple-400" />
              <span className="text-sm font-semibold text-gray-400">Program Owner</span>
            </div>
            <div className="font-mono text-sm text-white">
              {shortenAddress(appState.owner.toString(), 12)}
            </div>
            <a
              href={getAddressExplorerUrl(appState.owner.toString())}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-flex items-center"
            >
              View on Explorer <FiExternalLink className="ml-1" />
            </a>
          </div>
        </div>

        {/* Program Status */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FiCheckCircle className="text-green-400 mr-2" />
            Program Status
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div className="flex items-center space-x-2">
                <div className="status-indicator status-online"></div>
                <span className="font-semibold text-green-400">Initialized</span>
              </div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Network</div>
              <div className="font-semibold">Devnet</div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Users</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allUsers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No users yet</p>
            ) : (
              allUsers.slice(0, 10).map((user, index) => (
                <div
                  key={user.publicKey}
                  className="glass p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-400 font-mono">
                      {shortenAddress(user.publicKey, 8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Friends</div>
                    <div className="font-semibold">{user.friendCount || 0}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Non-admin view
  return null;
};

export default AdminDashboard;

import { useState } from 'react';
import { useChatApp } from '../context/ChatAppContext';
import { isValidPublicKey, shortenAddress, getInitials, getGradientForAddress } from '../utils/helpers';
import { FiX, FiUserPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import IPFSImage from './IPFSImage';

const AddFriend = ({ onClose }) => {
  const { allUsers, friends, addFriend, fetchAllUsers, loading } = useChatApp();
  const [friendAddress, setFriendAddress] = useState('');
  const [friendName, setFriendName] = useState('');
  const [searchMode, setSearchMode] = useState('address'); // 'address' or 'browse'

  const handleAddFriend = async (e) => {
    e.preventDefault();

    if (!friendAddress.trim()) {
      toast.error('Please enter a friend\'s address');
      return;
    }

    if (!isValidPublicKey(friendAddress.trim())) {
      toast.error('Invalid Solana address');
      return;
    }

    if (!friendName.trim()) {
      toast.error('Please enter a friend name');
      return;
    }

    const result = await addFriend(friendAddress.trim(), friendName.trim());
    if (result) {
      setFriendAddress('');
      setFriendName('');
      onClose();
    }
  };

  const handleSelectUser = (user) => {
    setFriendAddress(user.publicKey);
    setFriendName(user.name);
    setSearchMode('address');
  };

  const availableUsers = allUsers.filter(user => {
    // Exclude users who are already friends
    return !friends.some(friend => friend.publicKey === user.publicKey);
  });

  return (
    <div className="modal-overlay backdrop-blur-md" onClick={onClose}>
      <div className="modal-content max-w-2xl backdrop-blur-2xl bg-gray-900/95 border-2 border-gray-700/50 shadow-2xl shadow-indigo-500/20 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Animated Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Add Friend
            </h2>
            <p className="text-sm text-gray-400 mt-1">Connect with other users on the network</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-110 group"
          >
            <FiX className="text-2xl text-gray-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="relative z-10 flex space-x-3 mb-6 p-1 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-xl">
          <button
            onClick={() => setSearchMode('address')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
              searchMode === 'address'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 transform scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            By Address
          </button>
          <button
            onClick={() => {
              setSearchMode('browse');
              fetchAllUsers();
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
              searchMode === 'browse'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 transform scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Browse Users
          </button>
        </div>

        {/* Content */}
        {searchMode === 'address' ? (
          <form onSubmit={handleAddFriend} className="relative z-10 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Friend's Wallet Address
              </label>
              <input
                type="text"
                value={friendAddress}
                onChange={(e) => setFriendAddress(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-xl font-mono text-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Friend's Name
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Enter friend's name"
                className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-xl"
                maxLength={32}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">{friendName.length}/32 characters</p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50 text-white font-bold transition-all duration-300 hover:scale-105"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="relative flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                disabled={loading}
              >
                <span className="flex items-center justify-center space-x-2">
                  <FiUserPlus className="group-hover:scale-110 transition-transform" />
                  <span>{loading ? 'Adding...' : 'Add Friend'}</span>
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
              </button>
            </div>
          </form>
        ) : (
          <div className="relative z-10">
            {/* Browse Users */}
            <div className="mb-5 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <FiSearch className="text-indigo-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">
                    {availableUsers.length} users available
                  </span>
                  <p className="text-xs text-gray-400">Select a user to add as friend</p>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 scroll-smooth">
              {availableUsers.length === 0 ? (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="text-4xl text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg font-semibold">No users found</p>
                  <p className="text-gray-500 text-sm mt-2">Try again later or add by address</p>
                </div>
              ) : (
                availableUsers.map((user, index) => (
                  <button
                    key={user.publicKey}
                    onClick={() => handleSelectUser(user)}
                    className="w-full p-4 rounded-xl bg-gray-800/30 hover:bg-gradient-to-br hover:from-indigo-600/20 hover:to-purple-600/20 border-2 border-transparent hover:border-indigo-500/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 group animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {user.profilePicture ? (
                          <IPFSImage
                            ipfsHash={user.profilePicture}
                            alt={user.name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50 transition-all duration-300"
                            fallback={
                              <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50 transition-all duration-300"
                                style={{ background: getGradientForAddress(user.publicKey) }}
                              >
                                {getInitials(user.name)}
                              </div>
                            }
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50 transition-all duration-300"
                            style={{ background: getGradientForAddress(user.publicKey) }}
                          >
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                          {shortenAddress(user.publicKey, 8)}
                        </div>
                      </div>

                      {/* Add Button */}
                      <div className="flex-shrink-0">
                        <div className="p-3 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 border border-indigo-500/30 group-hover:border-indigo-500/50 transition-all duration-300 group-hover:scale-110">
                          <FiUserPlus className="text-indigo-400 text-xl group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriend;

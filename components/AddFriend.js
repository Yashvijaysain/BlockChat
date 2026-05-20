import { useState } from 'react';
import { useChatApp } from '../context/ChatAppContext';
import { isValidPublicKey, shortenAddress, getInitials, getGradientForAddress } from '../utils/helpers';
import { FiSearch, FiUserPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import IPFSImage from './IPFSImage';

const AddFriend = ({ onClose }) => {
  const { allUsers, friends, addFriend, fetchAllUsers, loading } = useChatApp();
  const [friendAddress, setFriendAddress] = useState('');
  const [friendName, setFriendName] = useState('');
  const [searchMode, setSearchMode] = useState('address');

  const handleAddFriend = async (e) => {
    e.preventDefault();

    if (!friendAddress.trim()) {
      toast.error('Please enter a friend address');
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
    return !friends.some(friend => friend.publicKey === user.publicKey);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl shadow-black/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-color)] px-4 py-4 sm:items-center sm:px-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Add friend</h2>
            <p className="text-sm text-[var(--text-muted)]">Connect with another wallet profile.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white"
            title="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-[var(--bg-tertiary)] p-1">
            <button
              onClick={() => setSearchMode('address')}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                searchMode === 'address'
                  ? 'bg-[var(--bg-elevated)] text-white'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              By address
            </button>
            <button
              onClick={() => {
                setSearchMode('browse');
                fetchAllUsers();
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                searchMode === 'browse'
                  ? 'bg-[var(--bg-elevated)] text-white'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              Browse users
            </button>
          </div>

          {searchMode === 'address' ? (
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Wallet address
                </label>
                <input
                  type="text"
                  value={friendAddress}
                  onChange={(e) => setFriendAddress(e.target.value)}
                  placeholder="Enter Solana wallet address"
                  className="input font-mono text-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Display name
                </label>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="Enter friend name"
                  className="input"
                  maxLength={32}
                  required
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">{friendName.length}/32 characters</p>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-2">
                    <FiUserPlus />
                    <span>{loading ? 'Adding...' : 'Add friend'}</span>
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25d366]/12 text-[#25d366]">
                  <FiSearch />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{availableUsers.length} users available</p>
                  <p className="text-xs text-[var(--text-muted)]">Select a user to fill the form.</p>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto pr-1">
                {availableUsers.length === 0 ? (
                  <div className="py-12 text-center">
                    <FiSearch className="mx-auto mb-3 text-3xl text-[var(--text-muted)]" />
                    <p className="font-semibold text-white">No users found</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Try adding a wallet address manually.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableUsers.map((user) => (
                      <button
                        key={user.publicKey}
                        onClick={() => handleSelectUser(user)}
                        className="w-full rounded-xl p-3 text-left hover:bg-[var(--bg-hover)]"
                      >
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <IPFSImage
                              ipfsHash={user.profilePicture}
                              alt={user.name}
                              className="h-11 w-11 rounded-full object-cover"
                              fallback={
                                <div
                                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                                  style={{ background: getGradientForAddress(user.publicKey) }}
                                >
                                  {getInitials(user.name)}
                                </div>
                              }
                            />
                          ) : (
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                              style={{ background: getGradientForAddress(user.publicKey) }}
                            >
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-white">{user.name}</p>
                            <p className="truncate font-mono text-sm text-[var(--text-muted)]">
                              {shortenAddress(user.publicKey, 8)}
                            </p>
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[#25d366]">
                            <FiUserPlus />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriend;

import { useState } from 'react';
import { useChatApp } from '../context/ChatAppContext';
import { getInitials, getGradientForAddress, formatTimestamp, shortenAddress } from '../utils/helpers';
import { FiMessageCircle, FiSearch, FiUserPlus } from 'react-icons/fi';
import AddFriend from './AddFriend';
import IPFSImage from './IPFSImage';

const FriendsList = () => {
  const { friends, selectedFriend, setSelectedFriend, messages } = useChatApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.publicKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (friendPublicKey) => {
    if (!messages || messages.length === 0) return null;
    if (selectedFriend?.publicKey === friendPublicKey) {
      return messages[messages.length - 1];
    }
    return null;
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border-color)] px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Chats</h2>
            <p className="text-sm text-[var(--text-muted)]">{friends.length} conversations</p>
          </div>
          <button
            onClick={() => setShowAddFriend(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25d366] text-[#07130f] hover:bg-[#35e173]"
            title="Add Friend"
          >
            <FiUserPlus className="text-lg" />
          </button>
        </div>

        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search or start a chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-transparent bg-[var(--bg-tertiary)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[#25d366]/40 focus:outline-none focus:ring-2 focus:ring-[#25d366]/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredFriends.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              <FiMessageCircle className="text-2xl" />
            </div>
            <h3 className="text-base font-semibold text-white">No conversations yet</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Add a friend by wallet address to start a direct chat.
            </p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="mt-5 rounded-xl bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-[#07130f] hover:bg-[#35e173]"
            >
              Add friend
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFriends.map((friend) => {
              const lastMessage = getLastMessage(friend.publicKey);
              const isSelected = selectedFriend?.publicKey === friend.publicKey;

              return (
                <button
                  key={friend.publicKey}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full rounded-xl px-3 py-3 text-left ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)]'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {friend.profilePicture ? (
                        <IPFSImage
                          ipfsHash={friend.profilePicture}
                          alt={friend.name}
                          className="h-12 w-12 rounded-full object-cover"
                          fallback={
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                              style={{ background: getGradientForAddress(friend.publicKey) }}
                            >
                              {getInitials(friend.name)}
                            </div>
                          }
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                          style={{ background: getGradientForAddress(friend.publicKey) }}
                        >
                          {getInitials(friend.name)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-secondary)] bg-[#25d366]"></span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-white">{friend.name}</span>
                        {lastMessage && (
                          <span className="shrink-0 text-xs text-[var(--text-muted)]">
                            {formatTimestamp(lastMessage.timestamp.toNumber())}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                        {lastMessage ? (lastMessage.content || 'Media message') : shortenAddress(friend.publicKey, 6)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showAddFriend && <AddFriend onClose={() => setShowAddFriend(false)} />}
    </aside>
  );
};

export default FriendsList;

import { useState } from 'react';
import { useChatApp } from '../context/ChatAppContext';
import { getInitials, getGradientForAddress, formatTimestamp } from '../utils/helpers';
import { FiSearch, FiUserPlus, FiMessageCircle } from 'react-icons/fi';
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

    // This would ideally be stored per friend, but for now we check if this is the selected friend
    if (selectedFriend?.publicKey === friendPublicKey) {
      return messages[messages.length - 1];
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 p-5 border-b border-gray-700/50 backdrop-blur-xl bg-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Messages
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{friends.length} conversations</p>
          </div>
          <button
            onClick={() => setShowAddFriend(true)}
            className="relative p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/50 group"
            title="Add Friend"
          >
            <FiUserPlus className="text-white text-xl" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 z-10" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-xl"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="relative z-10 flex-1 overflow-y-auto scroll-smooth">
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-xl border border-indigo-500/30 shadow-2xl">
                <FiMessageCircle className="text-5xl text-indigo-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              No friends yet
            </h3>
            <p className="text-gray-400 mb-6 text-base">
              Add friends to start chatting
            </p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="relative px-6 py-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 group"
            >
              <FiUserPlus className="inline mr-2" />
              Add Friend
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {filteredFriends.map((friend, index) => {
              const lastMessage = getLastMessage(friend.publicKey);
              const isSelected = selectedFriend?.publicKey === friend.publicKey;

              return (
                <button
                  key={friend.publicKey}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full p-4 rounded-xl transition-all duration-300 group animate-fadeIn ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20 backdrop-blur-xl'
                      : 'bg-gray-800/30 hover:bg-gray-800/50 border-2 border-transparent hover:border-gray-700/50 backdrop-blur-xl'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {friend.profilePicture ? (
                        <IPFSImage
                          ipfsHash={friend.profilePicture}
                          alt={friend.name}
                          className={`w-14 h-14 rounded-full object-cover transition-all duration-300 ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30'
                              : 'ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50'
                          }`}
                          fallback={
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                                isSelected
                                  ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30'
                                  : 'ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50'
                              }`}
                              style={{ background: getGradientForAddress(friend.publicKey) }}
                            >
                              {getInitials(friend.name)}
                            </div>
                          }
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30'
                              : 'ring-2 ring-gray-700/50 group-hover:ring-indigo-500/50'
                          }`}
                          style={{ background: getGradientForAddress(friend.publicKey) }}
                        >
                          {getInitials(friend.name)}
                        </div>
                      )}
                      {/* Online Indicator */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg shadow-green-400/50 animate-pulse"></div>
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold truncate transition-colors ${
                          isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                        }`}>
                          {friend.name}
                        </span>
                        {lastMessage && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2 font-medium">
                            {formatTimestamp(lastMessage.timestamp.toNumber())}
                          </span>
                        )}
                      </div>
                      {lastMessage ? (
                        <p className={`text-sm truncate transition-colors ${
                          isSelected ? 'text-indigo-200' : 'text-gray-400 group-hover:text-gray-300'
                        }`}>
                          {lastMessage.content || '📎 Media message'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && <AddFriend onClose={() => setShowAddFriend(false)} />}
    </div>
  );
};

export default FriendsList;

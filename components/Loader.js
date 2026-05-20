const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Loader Card */}
      <div className="relative backdrop-blur-2xl bg-gray-900/90 p-10 rounded-3xl border-2 border-gray-700/50 shadow-2xl shadow-indigo-500/30 flex flex-col items-center space-y-6 animate-fadeIn">
        {/* Spinner */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-indigo-500 border-r-purple-500 animate-spin"></div>

          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-xl opacity-50 animate-pulse"></div>

          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse shadow-lg shadow-indigo-500/50"></div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-white text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {message}
          </p>
          <div className="flex items-center justify-center space-x-1 mt-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;

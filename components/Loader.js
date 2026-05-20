const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-5 shadow-2xl shadow-black/30">
        <div className="spinner h-9 w-9"></div>
        <div>
          <p className="font-semibold text-white">{message}</p>
          <p className="text-sm text-[var(--text-muted)]">Please confirm wallet actions when prompted.</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;

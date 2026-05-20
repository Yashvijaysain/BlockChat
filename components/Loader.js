const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm items-center gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4 shadow-2xl shadow-black/30 sm:px-6 sm:py-5">
        <div className="spinner h-9 w-9 shrink-0"></div>
        <div className="min-w-0">
          <p className="font-semibold text-white">{message}</p>
          <p className="text-sm text-[var(--text-muted)]">Please confirm wallet actions when prompted.</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;

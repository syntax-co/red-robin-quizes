/* ------------------------------------------------------------------ */
/* 2.  Progress-Bar Component                                         */
/* ------------------------------------------------------------------ */
function ProgressBar({ current, total }) {
    const pct = Math.round(((current + 1) / total) * 100);
    return (
      <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
        <div
          className="bg-green-500 h-4 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
}


export default ProgressBar;
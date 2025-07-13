




/* ------------------------------------------------------------------ */
/* 1.  Start-Screen Component                                         */

import { useGlobalContext } from "@/context/global-context";

/* ------------------------------------------------------------------ */
function StartScreen({ difficulty, setDifficulty, selected, toggleSection, onStart}) {

  const { difficulties,menuData } = useGlobalContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white px-6 py-12">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        {/* difficulty */}
        <label className="block mb-6 text-lg font-medium">
          Difficulty
          <select
            className="mt-2 w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            {Object.keys(difficulties).map(l => (
              <option key={l} value={l}>
                {l[0].toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {/* section checkboxes */}
        <p className="mb-2 font-semibold">Choose Menu Sections</p>
        {Object.keys(menuData).map(sec => (
          <label key={sec} className="block mb-2 cursor-pointer">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected[sec] || false}
              onChange={() => toggleSection(sec)}
            />
            {sec}
          </label>
        ))}

        <button
          disabled={Object.values(selected).every(v => !v)}
          onClick={onStart}
          className="w-full mt-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg disabled:opacity-40"
        >
          🚀 Start Quiz
        </button>
      </div>
    </div>
  );
}



export default StartScreen;
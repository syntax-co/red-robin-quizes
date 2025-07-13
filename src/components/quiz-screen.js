import { useGlobalContext } from "@/context/global-context";
import ProgressBar from "./progress-bar";
import IngredientInput from "./ingredient-input";




function QuizScreen({
  question,
  guesses,
  setGuesses,
  showingAnswer,
  statuses,
  onHint,
  hintsUsed,
  hintsAllowed,
  onSubmit,
  onContinue,
  score,
  currentIdx,
  total,
}) {

    const {proteins} = useGlobalContext()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      {/* progress */}
      <ProgressBar current={currentIdx} total={total} />

      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4">
          Guess the ingredients for
          <span className="block mt-1 text-green-400">{question.name}</span>
        </h2>

        {/* inputs */}
        <div className="space-y-4 mb-6">
          {question.ingredients.map((ing, idx) => {
            const isProtein = proteins.includes(ing);
            const lockedVal  = question.blanks[idx] || (isProtein ? ing : '');

            return (
              <div key={idx}>
                <IngredientInput
                  idx={idx}
                  value={lockedVal || guesses[idx]}
                  locked={!!lockedVal}
                  onChange={val =>
                    setGuesses(prev => {
                      const next = [...prev];
                      next[idx] = val;
                      return next;
                    })
                  }
                  state={showingAnswer ? statuses[idx] : 'neutral'}
                />

                {/* NEW: after submit, if wrong, show both answers */}
                {showingAnswer && statuses[idx] === 'wrong' && (
                  <p className="mt-1 text-sm text-red-300">
                    <span className="font-semibold">Your answer:</span>{' '}
                    {guesses[idx] ? guesses[idx] : '(blank)'}
                    <br />
                    <span className="font-semibold text-green-300">Correct:</span>{' '}
                    {ing}
                  </p>
                )}
              </div>
            );
          })}
        </div>


        {/* buttons */}
        <div className="flex gap-4">
          {!showingAnswer ? (
            <>
              <button
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-semibold disabled:opacity-40"
                onClick={onHint}
                disabled={hintsUsed >= hintsAllowed}
              >
                💡 Hint ({hintsUsed}/{hintsAllowed})
              </button>
              <button
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold"
                onClick={onSubmit}
              >
                ✅ Submit
              </button>
            </>
          ) : (
            <button
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold"
              onClick={onContinue}
            >
              ➡️ Continue
            </button>
          )}
        </div>

        <p className="text-center mt-6 text-lg">
          🎯 Score:&nbsp;
          <span className="font-bold text-green-400">{score}</span>
        </p>
      </div>
    </div>
  );
}


export default QuizScreen;
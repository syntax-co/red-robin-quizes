// SandwichQuizGame.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import menuData from '../json_files/menu-items.json';

/* ------------------------------------------------------------------ */
/* Config                                                             */
/* ------------------------------------------------------------------ */
const difficulties = {
  easy:   { hintsAllowed: 3, prefillCount: 2, scoreValue: 10 },
  medium: { hintsAllowed: 2, prefillCount: 1, scoreValue: 20 },
  hard:   { hintsAllowed: 1, prefillCount: 0, scoreValue: 30 },
};

// Anything in this list will be SHOWN automatically and never counted
const proteins = [
  'Beef Patty', 'Crispy Chicken Breast', 'Grilled Chicken Breast',
  'Impossible Patty', 'Turkey Patty', 'Veggie Patty', 'Chicken Tenders',
  'Turkey', // for BLTA
];

/* ------------------------------------------------------------------ */
/* 1.  Start-Screen Component                                         */
/* ------------------------------------------------------------------ */
function StartScreen({ difficulty, setDifficulty, selected, toggleSection, onStart }) {
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

/* ------------------------------------------------------------------ */
/* 3.  Single-Input Component                                         */
/* ------------------------------------------------------------------ */
function IngredientInput({ idx, value, onChange, locked, state }) {
  /*
    state: 'neutral' | 'correct' | 'wrong'   (after submit)
  */
  const color =
    state === 'correct'
      ? 'bg-green-200 border-green-500'
      : state === 'wrong'
      ? 'bg-red-200 border-red-500'
      : 'bg-gray-100';

  return (
    <input
      type="text"
      placeholder={`Ingredient ${idx + 1}`}
      className={`w-full p-3 rounded-xl text-black text-lg border transition-all ${color}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={locked}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 4.  Quiz-Screen Component                                          */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* 5.  End-Screen Component                                           */
/* ------------------------------------------------------------------ */
function EndScreen({ score, onRestart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="bg-gray-800 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-4">Quiz Complete!</h1>
        <p className="text-xl mb-8">
          Your final score:&nbsp;
          <span className="font-bold text-green-400">{score}</span>
        </p>
        <button
          onClick={onRestart}
          className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg mb-4"
        >
          ⟳ Retry
        </button>
        <button
          onClick={onRestart}
          className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-bold text-lg"
        >
          🏠 Main Menu
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6.  Main Container Component                                       */
/* ------------------------------------------------------------------ */
export default function SandwichQuizGame() {
  /* global state */
  const [screen, setScreen] = useState('start'); // start | quiz | end
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedSections, setSelectedSections] = useState({});
  const [shuffled, setShuffled] = useState([]);
  const [qIdx, setQIdx] = useState(0);

  /* per-question state */
  const [question, setQuestion] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  /* score */
  const [score, setScore] = useState(0);

  /* ----------------------------------------------------------------*/
  /* Helpers                                                         */
  /* ----------------------------------------------------------------*/
  const toggleSection = sec =>
    setSelectedSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  const flattenMenu = useMemo(() => {
    /** Build a flat list of { name, ingredients } for selected sections */
    const list = [];
    for (const [mainKey, val] of Object.entries(menuData)) {
      if (!selectedSections[mainKey]) continue;

      if (mainKey === 'sandwiches') {
        // two nested levels
        for (const sub of Object.values(val)) {
          for (const [name, ing] of Object.entries(sub)) list.push({ name, ingredients: ing });
        }
      } else if (typeof val === 'object') {
        // one level
        for (const [name, ing] of Object.entries(val)) list.push({ name, ingredients: ing });
      }
    }
    return list;
  }, [selectedSections]);

  /* Initialize quiz */
  const startQuiz = () => {
    const shuffledItems = [...flattenMenu].sort(() => 0.5 - Math.random());
    setShuffled(shuffledItems);
    setQIdx(0);
    setScore(0);
    setScreen('quiz');
  };

  /* When qIdx changes, set new question */
  useEffect(() => {
    if (screen !== 'quiz') return;
    const item = shuffled[qIdx];
    if (!item) return;

    const blanks = item.ingredients.map(ing =>
      !proteins.includes(ing) ? '' : ing
    );

    // Prefill (difficulty)
    const { prefillCount } = difficulties[difficulty];
    let filled = 0;
    while (filled < prefillCount) {
      const idx = Math.floor(Math.random() * blanks.length);
      if (blanks[idx] === '' && !proteins.includes(item.ingredients[idx])) {
        blanks[idx] = item.ingredients[idx];
        filled++;
      }
    }

    setQuestion({ ...item, blanks });
    setGuesses(Array(item.ingredients.length).fill(''));
    setStatuses(Array(item.ingredients.length).fill('neutral'));
    setHintsUsed(0);
    setShowingAnswer(false);
  }, [qIdx, screen, difficulty, shuffled]);

  /* Hint handler */
  const handleHint = () => {
    const { hintsAllowed } = difficulties[difficulty];
    if (hintsUsed >= hintsAllowed) return;

    const blankIdxs = question.ingredients
      .map((_, i) => i)
      .filter(
        i =>
          !question.blanks[i] &&
          !proteins.includes(question.ingredients[i]) &&
          !guesses[i]
      );

    const reveal = blankIdxs.sort(() => 0.5 - Math.random()).slice(0, 2);

    const newBlanks = [...question.blanks];
    reveal.forEach(i => (newBlanks[i] = question.ingredients[i]));
    setQuestion(q => ({ ...q, blanks: newBlanks }));
    setHintsUsed(h => h + 1);
  };

  /* ------------------------------------------------------------------ */
  /* Submit handler  (replace your existing handleSubmit)               */
  /* ------------------------------------------------------------------ */
  const handleSubmit = () => {
    const { scoreValue } = difficulties[difficulty];

    // Build a per-index status list
    const newStatuses = question.ingredients.map((ing, i) => {
      const isProtein   = proteins.includes(ing);
      const isPrefilled = Boolean(question.blanks[i]);   // ← pre-filled by hints / difficulty

      if (isProtein || isPrefilled) return 'correct';    // auto-correct

      const guess = (guesses[i] || '').trim().toLowerCase();
      return guess === ing.toLowerCase() ? 'correct' : 'wrong';
    });

    // ▸ Only count points on fields the user was able to type in
    const guessableIdxs = question.ingredients
      .map((_, i) => i)
      .filter(i => !proteins.includes(question.ingredients[i]) && !question.blanks[i]);

    const correctCount = guessableIdxs.filter(i => newStatuses[i] === 'correct').length;
    const totalGuessable = guessableIdxs.length || 1; // avoid divide-by-zero

    const earned = Math.max(
      Math.round((correctCount / totalGuessable) * scoreValue - hintsUsed * 5),
      0
    );

    setScore(s => s + earned);
    setStatuses(newStatuses);

    // Reveal every ingredient
    setQuestion(q => ({ ...q, blanks: [...question.ingredients] }));
    setShowingAnswer(true);
  };


  /* Continue handler */
  const handleContinue = () => {
    if (qIdx + 1 < shuffled.length) {
      setQIdx(i => i + 1);
    } else {
      setScreen('end');
    }
  };

  /* Restart to main menu */
  const handleRestart = () => {
    setScreen('start');
    setSelectedSections({});
  };

  /* ----------------------------------------------------------------*/
  /* Render                                                          */
  /* ----------------------------------------------------------------*/
  if (screen === 'start')
    return (
      <StartScreen
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        selected={selectedSections}
        toggleSection={toggleSection}
        onStart={startQuiz}
      />
    );

  if (screen === 'quiz' && question)
    return (
      <QuizScreen
        question={question}
        guesses={guesses}
        setGuesses={setGuesses}
        showingAnswer={showingAnswer}
        statuses={statuses}
        onHint={handleHint}
        hintsUsed={hintsUsed}
        hintsAllowed={difficulties[difficulty].hintsAllowed}
        onSubmit={handleSubmit}
        onContinue={handleContinue}
        score={score}
        currentIdx={qIdx}
        total={shuffled.length}
      />
    );

  if (screen === 'end')
    return <EndScreen score={score} onRestart={handleRestart} />;

  return null; // fallback
}

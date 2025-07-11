// SandwichQuizGame.jsx
'use client';

import { useState, useEffect } from 'react';
import data from '../json_files/menu-items.json';

const difficulties = {
  easy: { hintsAllowed: 3, prefillCount: 2, scoreValue: 10 },
  medium: { hintsAllowed: 2, prefillCount: 1, scoreValue: 20 },
  hard: { hintsAllowed: 1, prefillCount: 0, scoreValue: 30 }
};

const IGNORED_INGREDIENTS = ['Beef Patty', 'Crispy Chicken Breast', 'Grilled Chicken Breast'];


export default function Index() {
    const [screen, setScreen] = useState('start');
    const [difficulty, setDifficulty] = useState('medium');
    const [question, setQuestion] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [showToast, setShowToast] = useState(null);
    const [showingAnswer, setShowingAnswer] = useState(false);
  
    useEffect(() => {
      if (screen === 'quiz') {
        const shuffled = [...allItems].sort(() => 0.5 - Math.random());
        setShuffledItems(shuffled);
        setQuestionIndex(0);
        generateNewQuestion(shuffled[0]);
      }
    }, [screen]);
  
    useEffect(() => {
      if (showToast) {
        const timeout = setTimeout(() => setShowToast(null), 2000);
        return () => clearTimeout(timeout);
      }
    }, [showToast]);
  
    const allItems = Object.entries(data).flatMap(([category, items]) =>
      Object.entries(items).map(([name, ingredients]) => ({
        category,
        name,
        ingredients,
        visibleIngredients: ingredients.map((ing, i) => ({
          text: ing,
          isIgnored: IGNORED_INGREDIENTS.includes(ing)
        }))
      }))
    );
  
    const generateNewQuestion = (item) => {
      const blanks = item.visibleIngredients.map(i => (i.isIgnored ? i.text : ''));
      for (let i = 0; i < difficulties[difficulty].prefillCount; i++) {
        const candidates = item.visibleIngredients.map((i, idx) => (!i.isIgnored && !blanks[idx] ? idx : null)).filter(Boolean);
        const idx = candidates[Math.floor(Math.random() * candidates.length)];
        if (idx !== undefined) blanks[idx] = item.visibleIngredients[idx].text;
      }
      setQuestion({ ...item, blanks });
      setGuesses(item.visibleIngredients.map(i => (i.isIgnored ? i.text : '')));
      setHintsUsed(0);
      setQuestionCount(prev => prev + 1);
    };
  
    const useHint = () => {
      if (hintsUsed >= difficulties[difficulty].hintsAllowed) return;
      const remaining = question.visibleIngredients.map((ing, idx) =>
        ing.isIgnored || guesses[idx] || question.blanks[idx] ? null : idx
      ).filter(i => i !== null);
  
      const numToReveal = Math.min(2, remaining.length);
      const revealIdxs = remaining.sort(() => 0.5 - Math.random()).slice(0, numToReveal);
      const updatedBlanks = [...question.blanks];
      revealIdxs.forEach(idx => updatedBlanks[idx] = question.visibleIngredients[idx].text);
      setQuestion({ ...question, blanks: updatedBlanks });
      setHintsUsed(hintsUsed + 1);
    };
  
    const submit = () => {
      const baseScore = difficulties[difficulty].scoreValue;
      let correct = 0;
      question.visibleIngredients.forEach((ing, idx) => {
        if (!ing.isIgnored && guesses[idx]?.trim().toLowerCase() === ing.text.toLowerCase()) correct++;
      });
      const total = question.visibleIngredients.filter(i => !i.isIgnored).length;
      const rawScore = (correct / total) * baseScore;
      const earned = Math.max(Math.round(rawScore - (hintsUsed * 5)), 0);
      setScore(prev => prev + earned);
  
      const filled = question.visibleIngredients.map((ing, idx) => guesses[idx] || ing.text);
      setQuestion({ ...question, blanks: filled });
      setShowingAnswer(true);
      setShowToast(correct === total ? `✅ +${earned} pts` : `✅ ${correct}/${total} correct, +${earned} pts`);
    };
  
    const restart = () => {
      setScore(0);
      setQuestionCount(0);
      setQuestionIndex(0);
      setShuffledItems([]);
      setScreen('start');
    };

  if (screen === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white px-6 py-12 font-sans">
        <div className="mb-12 text-center">
  
  <p className="text-gray-300 text-xl md:text-2xl font-light">
    Think you know what’s on your favorite sandwich? Let’s find out.
  </p>
</div>
        
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <label className="block mb-6 text-lg font-medium">
            Select Difficulty:
            <select
              className="mt-2 w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-green-400"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}>
              {Object.keys(difficulties).map(level => (
                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => setScreen('quiz')}
            className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg tracking-wide">
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className="min-h-screen p-10 bg-gray-950 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">🎉 Quiz Complete!</h1>
        <p className="text-xl mb-4">Your final score: <span className="text-green-400 font-bold">{score}</span></p>
        <div className="flex gap-4">
          <button onClick={restart} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
            🔁 Try Again
          </button>
          <button onClick={() => setScreen('start')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold">
            🏠 Main Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    question ? (
      <div className="min-h-screen p-6 bg-gray-950 text-white flex flex-col items-center">
        <div className="w-full max-w-3xl bg-gray-900 p-8 rounded-3xl shadow-2xl animate-fade-in">
          <div className="w-full mb-4">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.round((questionIndex / shuffledItems.length) * 100)}%` }}></div>
          </div>
        </div>

          <h2 className="text-4xl font-extrabold text-center mb-8 leading-snug">
            🧠 Guess the Ingredients for:
            <span className="block mt-2 text-green-400 text-5xl font-black">{question?.name || ''}</span>
          </h2>

          <div className="flex flex-col gap-4">
            {question.ingredients.map((_, idx) => {
              const userAnswer = guesses[idx];
              const correctAnswer = question.ingredients[idx];
              const isWrong = showingAnswer && userAnswer && userAnswer.toLowerCase() !== correctAnswer.toLowerCase();
              const isRight = showingAnswer && userAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase();

              return (
                <div key={idx} className="flex flex-col">
                  <input
                    type="text"
                    className={`w-full p-3 rounded-xl text-black text-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isWrong
                        ? 'bg-red-200 border border-red-500'
                        : isRight
                        ? 'bg-green-200 border border-green-500'
                        : 'bg-gray-100'
                    }`}
                    placeholder={`Ingredient ${idx + 1}`}
                    value={userAnswer || question.blanks[idx] || ''}
                    onChange={e => {
                      const updated = [...guesses];
                      updated[idx] = e.target.value;
                      setGuesses(updated);
                    }}
                    disabled={!!question.blanks[idx] || showingAnswer}
                  />

                  {isWrong && (
                    <div className="mt-1 text-sm text-red-400">
                      ❌ Your answer: <span className="italic">{userAnswer}</span> <br />✅ Correct: <span className="font-semibold">{correctAnswer}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <button
              onClick={useHint}
              disabled={hintsUsed >= difficulties[difficulty].hintsAllowed}
              className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-semibold disabled:opacity-50">
              💡 Hint ({hintsUsed}/{difficulties[difficulty].hintsAllowed})
            </button>
            <button
              onClick={showingAnswer ? () => {
                setShowingAnswer(false);
                const nextIndex = questionIndex + 1;
                if (nextIndex < shuffledItems.length) {
                  setQuestionIndex(nextIndex);
                  generateNewQuestion(shuffledItems[nextIndex]);
                } else {
                  setScreen('end');
                }
              } : submit}
              className={`flex-1 px-6 py-3 rounded-xl font-bold ${showingAnswer ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
              {showingAnswer ? '➡️ Continue' : '✅ Submit'}
            </button>
            <button
              onClick={restart}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold">
              🔁 Restart
            </button>
          </div>

          <div className="text-center mt-6 text-xl">
            🎯 Score: <span className="font-bold text-green-400">{score}</span>
          </div>
        </div>

        {showToast && (
          <div className="fixed bottom-6 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl animate-fade-in-out">
            {showToast}
          </div>
        )}
      </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-xl">Loading question...</p>
      </div>
    )
  );
}

// SandwichQuizGame.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';

import StartScreen from '@/components/start-screen';
import EndScreen from '@/components/end-screen';
import QuizScreen from '@/components/quiz-screen';
import { useGlobalContext } from '@/context/global-context';









/* ------------------------------------------------------------------ */
/* 5.  End-Screen Component                                           */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/* 6.  Main Container Component                                       */
/* ------------------------------------------------------------------ */
export default function SandwichQuizGame() {
  const {proteins,difficulties, menuData} = useGlobalContext()

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

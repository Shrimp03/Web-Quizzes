import { DEFAULT_MINDX_QUIZ } from '../data/defaultQuiz';

const QUIZZES_KEY = 'mindx_quiz_list_v1';
const ATTEMPTS_KEY = 'mindx_quiz_attempts_v1';

export function getQuizzes() {
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (!raw) {
      // First time initialization with default MindX 50 questions
      const initial = [DEFAULT_MINDX_QUIZ];
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(QUIZZES_KEY, JSON.stringify([DEFAULT_MINDX_QUIZ]));
      return [DEFAULT_MINDX_QUIZ];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load quizzes from localStorage', err);
    return [DEFAULT_MINDX_QUIZ];
  }
}

export function getQuizById(id) {
  const quizzes = getQuizzes();
  return quizzes.find(q => q.id === id) || quizzes[0];
}

export function saveQuiz(quiz) {
  const quizzes = getQuizzes();
  const existingIdx = quizzes.findIndex(q => q.id === quiz.id);

  const updatedQuiz = {
    ...quiz,
    updatedAt: new Date().toISOString()
  };

  let newQuizzes;
  if (existingIdx >= 0) {
    newQuizzes = [...quizzes];
    newQuizzes[existingIdx] = updatedQuiz;
  } else {
    updatedQuiz.createdAt = updatedQuiz.createdAt || new Date().toISOString();
    newQuizzes = [updatedQuiz, ...quizzes];
  }

  localStorage.setItem(QUIZZES_KEY, JSON.stringify(newQuizzes));
  return updatedQuiz;
}

export function deleteQuiz(id) {
  const quizzes = getQuizzes();
  const newQuizzes = quizzes.filter(q => q.id !== id);
  // Always keep at least the default quiz if all deleted
  if (newQuizzes.length === 0) {
    newQuizzes.push(DEFAULT_MINDX_QUIZ);
  }
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(newQuizzes));
  return newQuizzes;
}

export function restoreDefaultQuiz() {
  const quizzes = getQuizzes();
  const filtered = quizzes.filter(q => q.id !== DEFAULT_MINDX_QUIZ.id);
  const updated = [DEFAULT_MINDX_QUIZ, ...filtered];
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(updated));
  return updated;
}

export function saveAttempt(quizId, result) {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const attempts = raw ? JSON.parse(raw) : [];
    const newAttempt = {
      id: 'attempt-' + Date.now(),
      quizId,
      timestamp: new Date().toISOString(),
      ...result
    };
    attempts.unshift(newAttempt);
    // Keep max 50 recent attempts
    const limited = attempts.slice(0, 50);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(limited));
    return newAttempt;
  } catch (err) {
    console.error('Failed to save attempt', err);
  }
}

export function getAttempts(quizId = null) {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const attempts = raw ? JSON.parse(raw) : [];
    if (quizId) {
      return attempts.filter(a => a.quizId === quizId);
    }
    return attempts;
  } catch (e) {
    return [];
  }
}

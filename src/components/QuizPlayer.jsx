import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Bookmark, 
  RotateCw, 
  Shuffle, 
  Zap, 
  GraduationCap,
  AlertTriangle,
  Info
} from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizPlayer({ 
  quiz, 
  onFinishQuiz, 
  onExit,
  initialQuestions = null 
}) {
  // Mode: 'practice' (Instant feedback) or 'exam' (Submit at the end with timer)
  const [mode, setMode] = useState('practice');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [flagged, setFlagged] = useState(new Set()); // set of questionIndices
  const [isShuffledQuestions, setIsShuffledQuestions] = useState(false);
  const [isShuffledOptions, setIsShuffledOptions] = useState(false);

  // Time tracking
  const durationSeconds = (quiz.timeLimitMinutes || 45) * 60;
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [timerActive, setTimerActive] = useState(true);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Questions preparation
  const activeQuestions = useMemo(() => {
    let list = initialQuestions || quiz.questions || [];
    if (isShuffledQuestions) {
      list = [...list].sort(() => Math.random() - 0.5);
    }
    return list;
  }, [quiz, initialQuestions, isShuffledQuestions]);

  // Reset state when quiz changes
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setFlagged(new Set());
    setTimeLeft((quiz.timeLimitMinutes || 45) * 60);
    setTimerActive(true);
  }, [quiz]);

  // Timer countdown for Exam Mode
  useEffect(() => {
    if (mode !== 'exam' || !timerActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, timerActive, answers, activeQuestions]);

  const currentQ = activeQuestions[currentIndex] || {};
  const currentAnswer = answers[currentIndex];
  const isAnswered = currentAnswer !== undefined;
  const isFlagged = flagged.has(currentIndex);

  // Stats
  const answeredCount = Object.keys(answers).length;
  const totalCount = activeQuestions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Handle select option
  const handleSelectOption = (optIndex) => {
    if (mode === 'practice' && isAnswered) {
      // Allow changing answer even in practice mode if desired, or lock?
      // Let user change if they want to test
    }
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optIndex
    }));
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  const handleSubmit = (force = false) => {
    if (!force && answeredCount < totalCount) {
      setShowConfirmSubmit(true);
      return;
    }

    setTimerActive(false);

    // Calculate results
    let correctCount = 0;
    const details = activeQuestions.map((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        question: q,
        selectedIndex: selected,
        isCorrect: isCorrect,
        correctIndex: q.correctIndex
      };
    });

    const timeSpentSeconds = durationSeconds - timeLeft;

    onFinishQuiz({
      quizTitle: quiz.title,
      quizId: quiz.id,
      totalQuestions: totalCount,
      correctCount,
      wrongCount: totalCount - correctCount,
      answeredCount,
      timeSpentSeconds: mode === 'exam' ? timeSpentSeconds : null,
      mode,
      details
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {quiz.title}
              </span>
              {quiz.isDefault && (
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
                  Đề chuẩn MindX
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Câu {currentIndex + 1} / {totalCount}
            </h1>
          </div>

          {/* Mode Switcher & Tools */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Mode selection buttons */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setMode('practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  mode === 'practice'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Ôn luyện (Tức thì)</span>
              </button>
              <button
                onClick={() => setMode('exam')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  mode === 'exam'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Thi tính giờ</span>
              </button>
            </div>

            {/* Timer for Exam Mode */}
            {mode === 'exam' && (
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold ${
                timeLeft < 300 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Shuffle Button */}
            <button
              onClick={() => setIsShuffledQuestions(prev => !prev)}
              title="Đảo ngẫu nhiên thứ tự câu hỏi"
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
                isShuffledQuestions 
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Đảo câu</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmit(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm shadow-indigo-200 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài ({answeredCount}/{totalCount})</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Question Area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  {currentIndex + 1}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  Câu hỏi {currentIndex + 1} trong tổng số {totalCount}
                </span>
              </div>

              {/* Bookmark / Flag Button */}
              <button
                onClick={toggleFlag}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  isFlagged 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
                title="Đánh dấu câu hỏi cần xem lại"
              >
                <Bookmark className={`w-4 h-4 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span className="hidden sm:inline">{isFlagged ? 'Đã ghim cờ' : 'Ghim cờ'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="py-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {(currentQ.options || []).map((optText, optIdx) => {
                const isSelected = currentAnswer === optIdx;
                const isCorrectOpt = currentQ.correctIndex === optIdx;

                // Practice mode styling
                let optionStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700';
                let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                let feedbackIcon = null;

                if (mode === 'practice' && isAnswered) {
                  if (isSelected && isCorrectOpt) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-100';
                    badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                    feedbackIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
                  } else if (isSelected && !isCorrectOpt) {
                    optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 shadow-sm shadow-rose-100';
                    badgeStyle = 'bg-rose-500 text-white border-rose-500';
                    feedbackIcon = <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
                  } else if (!isSelected && isCorrectOpt) {
                    // Highlight the correct one
                    optionStyle = 'border-emerald-300 bg-emerald-50/70 text-emerald-900 border-dashed';
                    badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                    feedbackIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
                  } else {
                    optionStyle = 'opacity-60 border-slate-200 bg-white text-slate-400';
                  }
                } else if (isSelected) {
                  // Exam mode selected
                  optionStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-2 ring-indigo-500/20';
                  badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${optionStyle}`}
                  >
                    <div className="flex items-center space-x-3.5 pr-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border flex-shrink-0 ${badgeStyle}`}>
                        {LETTERS[optIdx] || optIdx + 1}
                      </span>
                      <span className="text-base font-medium leading-normal">{optText}</span>
                    </div>
                    {feedbackIcon}
                  </button>
                );
              })}
            </div>

            {/* Practice Mode Explanation Box */}
            {mode === 'practice' && isAnswered && (
              <div className={`mt-6 p-5 rounded-2xl border transition-all ${
                currentAnswer === currentQ.correctIndex 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm flex-shrink-0 mt-0.5">
                    {currentAnswer === currentQ.correctIndex ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Info className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm flex items-center gap-2">
                      {currentAnswer === currentQ.correctIndex ? (
                        <span className="text-emerald-700 font-extrabold">Chính xác! 🎉</span>
                      ) : (
                        <span className="text-amber-800 font-extrabold">
                          Chưa chính xác. Đáp án đúng là: {LETTERS[currentQ.correctIndex]}. {currentQ.options[currentQ.correctIndex]}
                        </span>
                      )}
                    </p>
                    {currentQ.explanation ? (
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-white/70 p-3 rounded-xl border border-black/5">
                        <strong className="text-slate-900">Giải thích chi tiết: </strong> {currentQ.explanation}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic mt-1">
                        (Chưa có chú thích giải thích cho câu hỏi này)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Question Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="flex items-center space-x-2">
                {isAnswered && (
                  <button
                    onClick={() => {
                      setAnswers(prev => {
                        const copy = { ...prev };
                        delete copy[currentIndex];
                        return copy;
                      });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Xóa lựa chọn
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  if (currentIndex < totalCount - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    handleSubmit(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2 shadow-sm shadow-indigo-200 transition-colors"
              >
                <span>{currentIndex < totalCount - 1 ? 'Câu tiếp theo' : 'Nộp bài'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Sidebar: Question Grid Palette (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Danh sách câu hỏi</h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {answeredCount}/{totalCount}
              </span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600"></span>
                <span>{mode === 'practice' ? 'Đúng' : 'Đã làm'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span>{mode === 'practice' ? 'Sai' : 'Chưa làm'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-400"></span>
                <span>Đặt cờ</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded border-2 border-indigo-600"></span>
                <span>Đang chọn</span>
              </div>
            </div>

            {/* Grid of buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5 max-h-[460px] overflow-y-auto p-1">
              {activeQuestions.map((q, idx) => {
                const ans = answers[idx];
                const isCur = idx === currentIndex;
                const isFlg = flagged.has(idx);

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';

                if (mode === 'practice') {
                  if (ans !== undefined) {
                    if (ans === q.correctIndex) {
                      btnClass = 'bg-emerald-600 text-white font-bold';
                    } else {
                      btnClass = 'bg-rose-500 text-white font-bold';
                    }
                  }
                } else {
                  // exam mode
                  if (ans !== undefined) {
                    btnClass = 'bg-indigo-600 text-white font-bold';
                  }
                }

                if (isFlg) {
                  btnClass += ' ring-2 ring-amber-400';
                }

                if (isCur) {
                  btnClass += ' outline outline-2 outline-offset-1 outline-indigo-700 scale-105 shadow-sm z-10';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 text-xs rounded-lg transition-all flex items-center justify-center font-semibold relative ${btnClass}`}
                  >
                    {idx + 1}
                    {isFlg && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Exit / Change Quiz */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={onExit}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Thoát ra danh sách đề
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Modal when not all questions are answered */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Bạn có chắc chắn muốn nộp bài?</h3>
            <p className="text-sm text-slate-600 text-center mt-2">
              Bạn mới hoàn thành <strong className="text-slate-900">{answeredCount}</strong> trên tổng số <strong className="text-slate-900">{totalCount}</strong> câu hỏi. Còn {totalCount - answeredCount} câu chưa có đáp án.
            </p>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

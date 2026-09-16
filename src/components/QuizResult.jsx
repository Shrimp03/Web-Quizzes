import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowLeft, 
  Award, 
  Clock, 
  Filter, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizResult({ 
  result, 
  onRetakeAll, 
  onRetakeWrong, 
  onBackToList 
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'wrong', 'correct'

  const {
    quizTitle,
    totalQuestions,
    correctCount,
    wrongCount,
    answeredCount,
    timeSpentSeconds,
    details = []
  } = result;

  const score10 = totalQuestions > 0 ? ((correctCount / totalQuestions) * 10).toFixed(1) : 0;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const skippedCount = totalQuestions - answeredCount;

  // Trigger confetti if high score
  useEffect(() => {
    if (percentage >= 80) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [percentage]);

  const filteredDetails = details.filter(d => {
    if (filter === 'wrong') return !d.isCorrect;
    if (filter === 'correct') return d.isCorrect;
    return true;
  });

  const getEvaluation = () => {
    if (percentage >= 90) return { title: 'Xuất sắc! Đạt điểm tuyệt đối!', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (percentage >= 75) return { title: 'Rất tốt! Đạt chuẩn chuyên môn!', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (percentage >= 50) return { title: 'Đạt yêu cầu cơ bản!', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { title: 'Cần ôn tập thêm!', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const evaluation = getEvaluation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Result Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 text-center relative overflow-hidden">
        
        {/* Background gradient decorative element */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border-indigo-100">
            <Award className="w-4 h-4" />
            <span>Kết quả bài kiểm tra</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {quizTitle}
          </h1>

          <div className={`inline-block px-4 py-1.5 rounded-full border text-sm font-semibold ${evaluation.color}`}>
            {evaluation.title}
          </div>

          {/* Big Score Display */}
          <div className="py-4">
            <div className="inline-flex items-baseline space-x-2">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {score10}
              </span>
              <span className="text-2xl font-bold text-slate-400">/ 10</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Đúng {correctCount} trên tổng số {totalQuestions} câu ({percentage}%)
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <span className="text-xs font-semibold text-emerald-700 block">Số câu đúng</span>
              <span className="text-2xl font-bold text-emerald-800">{correctCount}</span>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
              <span className="text-xs font-semibold text-rose-700 block">Số câu sai</span>
              <span className="text-2xl font-bold text-rose-800">{wrongCount}</span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
              <span className="text-xs font-semibold text-amber-700 block">Bỏ qua / Chưa làm</span>
              <span className="text-2xl font-bold text-amber-800">{skippedCount}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs font-semibold text-slate-600 block">Thời gian</span>
              <span className="text-2xl font-bold text-slate-800">
                {timeSpentSeconds ? `${Math.floor(timeSpentSeconds / 60)}p ${timeSpentSeconds % 60}s` : '--'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <button
              onClick={onRetakeAll}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại toàn bộ</span>
            </button>

            {wrongCount > 0 && (
              <button
                onClick={onRetakeWrong}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center space-x-2 transition-colors"
              >
                <Zap className="w-4 h-4 text-rose-600" />
                <span>Ôn lại {wrongCount} câu sai</span>
              </button>
            )}

            <button
              onClick={onBackToList}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Danh sách đề</span>
            </button>
          </div>

        </div>
      </div>

      {/* Question Details Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        {/* Header & Filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết từng câu hỏi & Lời giải</h2>
            <p className="text-xs text-slate-500">Xem lại đáp án đã chọn, đáp án chuẩn và phân tích giải thích</p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({totalQuestions})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'wrong' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Câu sai ({wrongCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'correct' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Câu đúng ({correctCount})
            </button>
          </div>
        </div>

        {/* List of Questions */}
        <div className="space-y-6">
          {filteredDetails.map((item, index) => {
            const { question: q, selectedIndex, isCorrect, correctIndex } = item;
            const originalIndex = details.indexOf(item) + 1;

            return (
              <div 
                key={index}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect 
                    ? 'border-slate-200 bg-white' 
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Question title & status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-700">
                      {originalIndex}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  {isCorrect ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đúng</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex-shrink-0">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{selectedIndex === undefined ? 'Chưa trả lời' : 'Sai'}</span>
                    </span>
                  )}
                </div>

                {/* Options display */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(q.options || []).map((opt, oIdx) => {
                    const isChosen = selectedIndex === oIdx;
                    const isTheCorrect = correctIndex === oIdx;

                    let optBg = 'bg-slate-50 border-slate-200 text-slate-600';
                    let badgeBg = 'bg-slate-200 text-slate-700';

                    if (isTheCorrect) {
                      optBg = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                      badgeBg = 'bg-emerald-600 text-white';
                    } else if (isChosen && !isTheCorrect) {
                      optBg = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                      badgeBg = 'bg-rose-500 text-white';
                    }

                    return (
                      <div 
                        key={oIdx}
                        className={`p-3 rounded-xl border text-sm flex items-center justify-between ${optBg}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${badgeBg}`}>
                            {LETTERS[oIdx] || oIdx + 1}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isTheCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                        {isChosen && !isTheCorrect && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                    <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Giải thích: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

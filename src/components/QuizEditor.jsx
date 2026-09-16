import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle,
  Copy,
  Clock
} from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizEditor({ quizToEdit, onSave, onCancel }) {
  const [title, setTitle] = useState(quizToEdit?.title || 'Đề kiểm tra trắc nghiệm mới');
  const [description, setDescription] = useState(quizToEdit?.description || '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(quizToEdit?.timeLimitMinutes || 45);

  const [questions, setQuestions] = useState(
    quizToEdit?.questions ? JSON.parse(JSON.stringify(quizToEdit.questions)) : [
      {
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        timeSeconds: 30
      }
    ]
  );

  const [errorMsg, setErrorMsg] = useState('');

  // Add question
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        timeSeconds: 30
      }
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      alert('Đề thi cần có tối thiểu 1 câu hỏi.');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // Duplicate question
  const handleDuplicateQuestion = (idx) => {
    const target = JSON.parse(JSON.stringify(questions[idx]));
    target.id = Date.now();
    const updated = [...questions];
    updated.splice(idx + 1, 0, target);
    setQuestions(updated);
  };

  // Change question text
  const handleQuestionTextChange = (idx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx].question = text;
      return copy;
    });
  };

  // Change option text
  const handleOptionTextChange = (qIdx, optIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].options[optIdx] = text;
      return copy;
    });
  };

  // Add option to question
  const handleAddOption = (qIdx) => {
    setQuestions(prev => {
      const copy = [...prev];
      if (copy[qIdx].options.length >= 6) return prev;
      copy[qIdx].options.push('');
      return copy;
    });
  };

  // Remove option from question
  const handleRemoveOption = (qIdx, optIdx) => {
    setQuestions(prev => {
      const copy = [...prev];
      if (copy[qIdx].options.length <= 2) {
        alert('Mỗi câu hỏi cần tối thiểu 2 lựa chọn.');
        return prev;
      }
      copy[qIdx].options = copy[qIdx].options.filter((_, i) => i !== optIdx);
      if (copy[qIdx].correctIndex >= copy[qIdx].options.length) {
        copy[qIdx].correctIndex = 0;
      }
      return copy;
    });
  };

  // Set correct index
  const handleSetCorrect = (qIdx, optIdx) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].correctIndex = optIdx;
      return copy;
    });
  };

  // Change explanation
  const handleExplanationChange = (qIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].explanation = text;
      return copy;
    });
  };

  const handleSave = () => {
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề bài kiểm tra.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (questions.length === 0) {
      setErrorMsg('Đề thi phải có ít nhất 1 câu hỏi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`Câu hỏi số ${i + 1} chưa có nội dung câu hỏi.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const validOpts = q.options.filter(o => o.trim() !== '');
      if (validOpts.length < 2) {
        setErrorMsg(`Câu hỏi số ${i + 1} cần có ít nhất 2 đáp án không được để trống.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const payload = {
      id: quizToEdit?.id || 'quiz-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      timeLimitMinutes: parseInt(timeLimitMinutes, 10) || 45,
      isDefault: quizToEdit?.isDefault || false,
      createdAt: quizToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: questions.map((q, idx) => ({
        id: idx + 1,
        question: q.question.trim(),
        options: q.options.map(o => o.trim()),
        correctIndex: q.correctIndex,
        explanation: q.explanation ? q.explanation.trim() : '',
        timeSeconds: q.timeSeconds || 30
      }))
    };

    onSave(payload);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hủy / Quay lại</span>
        </button>

        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl shadow-sm shadow-indigo-200 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Lưu bài kiểm tra ({questions.length} câu)</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quiz Metadata Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
        <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
          {quizToEdit ? 'Cập nhật đề kiểm tra' : 'Tạo mới đề kiểm tra'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Tiêu đề đề thi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kiểm tra chuyên môn đầu vào MindX"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Thời gian thi (phút)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="300"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Mô tả / Hướng dẫn
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Đề thi dành cho ứng viên Giáo viên và Trợ giảng..."
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 resize-none"
          />
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Danh sách câu hỏi ({questions.length})
          </h3>
          <button
            onClick={handleAddQuestion}
            className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi</span>
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div 
            key={qIdx}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5 relative"
          >
            {/* Question Header & Tools */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {qIdx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Câu hỏi #{qIdx + 1}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDuplicateQuestion(qIdx)}
                  title="Nhân bản câu hỏi này"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveQuestion(qIdx)}
                  title="Xóa câu hỏi này"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question text textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Nội dung câu hỏi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="2"
                value={q.question}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
              />
            </div>

            {/* Options list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Các lựa chọn đáp án (Chọn nút tròn để đặt đáp án đúng):
                </label>
                {q.options.length < 6 && (
                  <button
                    onClick={() => handleAddOption(qIdx)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    + Thêm lựa chọn
                  </button>
                )}
              </div>

              {q.options.map((opt, optIdx) => {
                const isCorrect = q.correctIndex === optIdx;
                return (
                  <div key={optIdx} className="flex items-center space-x-2.5">
                    {/* Radio to pick correct */}
                    <button
                      type="button"
                      onClick={() => handleSetCorrect(qIdx, optIdx)}
                      title={isCorrect ? 'Đáp án đúng' : 'Bấm để chọn làm đáp án đúng'}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs transition-all flex-shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {LETTERS[optIdx] || optIdx + 1}
                    </button>

                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                      placeholder={`Lựa chọn ${LETTERS[optIdx] || optIdx + 1}...`}
                      className={`flex-1 px-3.5 py-2 rounded-xl border text-sm focus:outline-none transition-colors ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-50/30 text-emerald-950 font-medium'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />

                    {isCorrect && (
                      <span className="text-xs font-bold text-emerald-600 hidden sm:inline px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                        Đúng
                      </span>
                    )}

                    {q.options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(qIdx, optIdx)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        title="Xóa lựa chọn này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-600">
                Lời giải thích / Ghi chú (Tùy chọn):
              </label>
              <textarea
                rows="2"
                value={q.explanation || ''}
                onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                placeholder="Giải thích vì sao đáp án này đúng để người làm bài ôn tập..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-700 bg-slate-50/50"
              />
            </div>
          </div>
        ))}

        {/* Add question bottom button */}
        <button
          onClick={handleAddQuestion}
          className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-3xl font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm câu hỏi mới</span>
        </button>

        {/* Bottom Save Bar */}
        <div className="pt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm text-white shadow-md shadow-indigo-200 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu bài kiểm tra</span>
          </button>
        </div>

      </div>

    </div>
  );
}

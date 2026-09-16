import React from 'react';
import { 
  BookOpen, 
  ListChecks, 
  PlusCircle, 
  UploadCloud, 
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  quizzes, 
  activeQuiz, 
  setActiveQuiz,
  onResetMindXQuiz 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('list')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MindX Quiz Master</span>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-indigo-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Luyện thi trắc nghiệm & Quản lý đề thi</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('play')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentTab === 'play'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Làm bài thi</span>
            </button>

            <button
              onClick={() => setCurrentTab('list')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentTab === 'list'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Quản lý đề ({quizzes.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('create')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentTab === 'create'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo đề mới</span>
            </button>

            <button
              onClick={() => setCurrentTab('import')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentTab === 'import'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Excel / Text</span>
            </button>
          </nav>

          {/* Quiz Selector & Quick Action */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-slate-500 font-medium">Đề đang chọn:</span>
              <select
                value={activeQuiz?.id || ''}
                onChange={(e) => {
                  const target = quizzes.find(q => q.id === e.target.value);
                  if (target) {
                    setActiveQuiz(target);
                    setCurrentTab('play');
                  }
                }}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none max-w-[200px] truncate cursor-pointer"
              >
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.questions.length} câu)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onResetMindXQuiz}
              title="Khôi phục đề chuẩn MindX 50 câu gốc"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-slate-200 py-2 space-x-1 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('play')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'play' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Làm bài
          </button>
          <button
            onClick={() => setCurrentTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            DS Đề ({quizzes.length})
          </button>
          <button
            onClick={() => setCurrentTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tạo đề
          </button>
          <button
            onClick={() => setCurrentTab('import')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'import' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Import File
          </button>
        </div>
      </div>
    </header>
  );
}

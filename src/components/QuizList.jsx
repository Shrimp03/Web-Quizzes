import React from 'react';
import { 
  Play, 
  Edit3, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Clock, 
  HelpCircle, 
  Plus, 
  UploadCloud, 
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { exportQuizToExcel } from '../utils/excelParser';
import { exportQuizToText } from '../utils/textParser';

export default function QuizList({ 
  quizzes, 
  onSelectQuiz, 
  onEditQuiz, 
  onDeleteQuiz, 
  onCreateNew, 
  onOpenImport,
  onResetMindXQuiz 
}) {

  const handleDownloadText = (quiz) => {
    const text = exportQuizToText(quiz);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.replace(/[\\/:*?"<>|]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = (quiz) => {
    exportQuizToExcel(quiz);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kho Đề Thi & Quản Lý</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Quản lý Bài Kiểm Tra & Ôn Luyện
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
            Hệ thống hỗ trợ làm bài thi trắc nghiệm, tạo mới, chỉnh sửa, nhập đề từ Excel hoặc file Text với đáp án và lời giải chi tiết.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onCreateNew}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-xl flex items-center space-x-2 shadow-md shadow-indigo-950/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề thi mới</span>
            </button>
            <button
              onClick={onOpenImport}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 flex items-center space-x-2 transition-colors backdrop-blur-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Excel / Text</span>
            </button>
            <button
              onClick={onResetMindXQuiz}
              title="Khôi phục lại đề thi 50 câu chuẩn MindX"
              className="px-4 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-semibold text-sm rounded-xl border border-emerald-400/30 flex items-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục đề MindX 50 câu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Danh sách đề thi hiện có ({quizzes.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const qCount = quiz.questions?.length || 0;
            const timeLimit = quiz.timeLimitMinutes || 45;

            return (
              <div 
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    {quiz.isDefault ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Đề chuẩn MindX
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                        Đề tự tạo / Import
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {quiz.description || 'Chưa có mô tả chi tiết cho đề thi này.'}
                    </p>
                  </div>

                  {/* Meta Stats */}
                  <div className="flex items-center space-x-4 pt-2 text-xs font-medium text-slate-600 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span>{qCount} câu hỏi</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{timeLimit} phút</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectQuiz(quiz)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm shadow-indigo-200 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Làm bài</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      title="Chỉnh sửa đề thi"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownloadExcel(quiz)}
                      title="Xuất file Excel (.xlsx)"
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownloadText(quiz)}
                      title="Xuất file Text (.txt)"
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {!quiz.isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa đề thi "${quiz.title}"?`)) {
                            onDeleteQuiz(quiz.id);
                          }
                        }}
                        title="Xóa đề thi"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

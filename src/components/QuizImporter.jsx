import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles, 
  Zap,
  Info,
  BookOpen,
  Download
} from 'lucide-react';
import { parseQuizFromExcel, exportQuizToExcel } from '../utils/excelParser';
import { parseQuizFromText } from '../utils/textParser';
import { DEFAULT_MINDX_QUIZ } from '../data/defaultQuiz';

const SAMPLE_TEXT_TEMPLATE = `1. Kiểm tra chuyên môn đầu vào kéo dài bao lâu?
A. 30 phút
B. 40 phút
C. 45 phút
D. 60 phút
ANSWER: C
GIẢI THÍCH: Kiểm tra chuyên môn đầu vào được thực hiện trong 45 phút.

2. Một đề kiểm tra chuyên môn đầu vào có bao nhiêu câu?
A. 25
B. 30
C. 40
D. 45
ANSWER: C
GIẢI THÍCH: Tài liệu nêu 40 câu/đề.

3. Ứng viên phải dự thính tối thiểu bao nhiêu buổi?
A. 3 buổi
B. 4 buổi
C. 5 buổi
D. 10 buổi
ANSWER: C
GIẢI THÍCH: Đào tạo tại cơ sở yêu cầu dự thính tối thiểu 5 buổi.`;

export default function QuizImporter({ onImportSuccess, onCancel }) {
  const [activeTab, setActiveTab] = useState('excel'); // 'excel', 'text', 'guide'

  // Excel state
  const [excelFile, setExcelFile] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);
  const [excelError, setExcelError] = useState('');
  const fileInputRef = useRef(null);

  // Text state
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('Đề kiểm tra nhập từ Text');
  const [textResult, setTextResult] = useState(null);
  const [textError, setTextError] = useState('');

  // Handle Excel file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setExcelLoading(true);
    setExcelError('');
    setExcelResult(null);

    try {
      const parsed = await parseQuizFromExcel(file, file.name.replace(/\.[^/.]+$/, ''));
      setExcelResult(parsed);
    } catch (err) {
      console.error(err);
      setExcelError(err.message || 'Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
    } finally {
      setExcelLoading(false);
    }
  };

  // Quick load default MindX 50 questions
  const handleLoadBundledMindX = () => {
    setExcelResult({
      quiz: {
        ...DEFAULT_MINDX_QUIZ,
        id: 'mindx-imported-' + Date.now(),
        title: 'MindX 50 Câu (Import từ file Excel MindX)'
      },
      errors: []
    });
    setExcelFile({ name: 'MindX_50_cau_Quizizz_Wayground.xlsx' });
  };

  // Parse Text
  const handleParseText = () => {
    setTextError('');
    setTextResult(null);

    if (!textInput.trim()) {
      setTextError('Vui lòng dán văn bản chứa danh sách câu hỏi trắc nghiệm.');
      return;
    }

    try {
      const parsed = parseQuizFromText(textInput, textTitle);
      setTextResult(parsed);
    } catch (err) {
      console.error(err);
      setTextError(err.message || 'Lỗi khi phân tích văn bản.');
    }
  };

  const handlePasteSampleText = () => {
    setTextInput(SAMPLE_TEXT_TEMPLATE);
    setTextTitle('Đề mẫu MindX 3 câu trắc nghiệm');
  };

  // Finalize import
  const handleSaveImportedQuiz = (quiz) => {
    onImportSuccess(quiz);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <h1 className="text-lg font-bold text-slate-900">
          Nhập Đề Thi Siêu Tốc (Import)
        </h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('excel')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'excel'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Nhập từ File Excel (.xlsx)</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'text'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Nhập từ Text (Aiken / ANSWER: C)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'guide'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Hướng dẫn định dạng</span>
        </button>
      </div>

      {/* TAB 1: EXCEL IMPORT */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Import bài kiểm tra từ File Excel
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Hỗ trợ trực tiếp định dạng Quizizz/Wayground từ file <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">MindX_50_cau_Quizizz_Wayground.xlsx</code>
                </p>
              </div>

              {/* Quick load bundled MindX */}
              <button
                onClick={handleLoadBundledMindX}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>⚡ Nạp file Excel MindX có sẵn</span>
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-3 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">
                  {excelFile ? excelFile.name : 'Bấm để chọn file Excel (.xlsx) hoặc kéo thả vào đây'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ các file định dạng .xlsx, .xls có sheet câu hỏi trắc nghiệm
                </p>
              </div>
            </div>

            {excelLoading && (
              <div className="text-center py-4 text-sm font-semibold text-indigo-600 animate-pulse">
                Đang đọc và phân tích file Excel...
              </div>
            )}

            {excelError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{excelError}</span>
              </div>
            )}

            {/* Excel Preview */}
            {excelResult && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">
                        Đọc thành công {excelResult.quiz.questions.length} câu hỏi!
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {excelResult.quiz.title} • Thời gian gợi ý: {excelResult.quiz.timeLimitMinutes} phút
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveImportedQuiz(excelResult.quiz)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-colors flex items-center space-x-1.5"
                  >
                    <span>Lưu & Vào Làm Bài</span>
                  </button>
                </div>

                {/* Sample first 3 questions preview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Xem trước một số câu hỏi ({excelResult.quiz.questions.length} câu):
                  </h4>
                  {excelResult.quiz.questions.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                      <p className="font-bold text-slate-800">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pl-3">
                        {q.options.map((opt, oIdx) => (
                          <span 
                            key={oIdx} 
                            className={`p-1.5 rounded-lg border ${
                              oIdx === q.correctIndex 
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' 
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctIndex && '✓'}
                          </span>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-slate-500 italic pl-3">
                          Giải thích: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 2: TEXT IMPORT */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Import bài kiểm tra từ định dạng Văn bản (Text)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Đúng theo định dạng chuẩn: <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono">1. Câu hỏi... A. Lựa chọn... ANSWER: C</code>
                </p>
              </div>

              <button
                onClick={handlePasteSampleText}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dán mẫu thử nghiệm</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Tên bài kiểm tra:
              </label>
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="VD: Kiểm tra chuyên môn đầu vào MindX"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Dán nội dung câu hỏi & đáp án vào đây:
              </label>
              <textarea
                rows="12"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`1. Kiểm tra chuyên môn đầu vào kéo dài bao lâu?\nA. 30 phút\nB. 40 phút\nC. 45 phút\nD. 60 phút\nANSWER: C\n\n2. Một đề kiểm tra chuyên môn đầu vào có bao nhiêu câu?\nA. 25\nB. 30\nC. 40\nD. 45\nANSWER: C`}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Hệ thống tự động phát hiện A, B, C, D và dòng ANSWER / Đáp án.
              </span>
              <button
                onClick={handleParseText}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-colors flex items-center space-x-1.5"
              >
                <span>Phân tích cú pháp & Xem trước</span>
              </button>
            </div>

            {textError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{textError}</span>
              </div>
            )}

            {/* Text Preview */}
            {textResult && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">
                        Phân tích thành công {textResult.quiz.questions.length} câu hỏi!
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {textResult.quiz.title} • Thời gian làm bài: {textResult.quiz.timeLimitMinutes} phút
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveImportedQuiz(textResult.quiz)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-colors"
                  >
                    Lưu & Bắt đầu làm bài
                  </button>
                </div>

                {/* Sample preview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Xem trước câu hỏi nhận diện được ({textResult.quiz.questions.length} câu):
                  </h4>
                  {textResult.quiz.questions.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                      <p className="font-bold text-slate-800">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pl-3">
                        {q.options.map((opt, oIdx) => (
                          <span 
                            key={oIdx} 
                            className={`p-1.5 rounded-lg border ${
                              oIdx === q.correctIndex 
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' 
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctIndex && '✓'}
                          </span>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-slate-500 italic pl-3">
                          Giải thích: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: GUIDELINES */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Hướng dẫn định dạng file để Import nhanh
          </h2>

          <div className="space-y-6 text-sm text-slate-700">
            
            {/* Guide 1: Text */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <h3 className="font-bold text-indigo-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                1. Định dạng Text (Aiken / Mẫu đề bài)
              </h3>
              <p className="text-xs sm:text-sm text-indigo-800 leading-relaxed">
                Mỗi câu hỏi gồm số thứ tự hoặc "Câu X:", theo sau là các lựa chọn A, B, C, D và dòng ANSWER: (chữ cái đáp án đúng). Có thể kèm dòng GIẢI THÍCH:
              </p>
              <pre className="p-3 rounded-xl bg-white border border-indigo-200 font-mono text-xs overflow-x-auto text-slate-800">
{`1. Kiểm tra chuyên môn đầu vào kéo dài bao lâu?
A. 30 phút
B. 40 phút
C. 45 phút
D. 60 phút
ANSWER: C
GIẢI THÍCH: Kiểm tra chuyên môn đầu vào được thực hiện trong 45 phút.`}
              </pre>
            </div>

            {/* Guide 2: Excel */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                2. Định dạng File Excel (.xlsx) chuẩn Quizizz/Wayground
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Sheet tên là <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">Quizizz_Import</code> có 11 cột:
              </p>
              <ul className="list-disc pl-5 text-xs space-y-1 text-emerald-950 font-medium">
                <li><strong>Cột 1:</strong> Question Text (Nội dung câu hỏi)</li>
                <li><strong>Cột 2:</strong> Question Type (Multiple Choice)</li>
                <li><strong>Cột 3 - 7:</strong> Option 1, Option 2, Option 3, Option 4, Option 5</li>
                <li><strong>Cột 8:</strong> Correct Answer (Là số 1, 2, 3, 4 hoặc chữ A, B, C, D)</li>
                <li><strong>Cột 9:</strong> Time in seconds (Thời gian giây, ví dụ: 30)</li>
                <li><strong>Cột 10:</strong> Image Link (Link ảnh nếu có)</li>
                <li><strong>Cột 11:</strong> Answer explanation (Giải thích chi tiết)</li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => exportQuizToExcel(DEFAULT_MINDX_QUIZ)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file Excel mẫu MindX (.xlsx)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

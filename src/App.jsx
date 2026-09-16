import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuizPlayer from './components/QuizPlayer';
import QuizResult from './components/QuizResult';
import QuizList from './components/QuizList';
import QuizEditor from './components/QuizEditor';
import QuizImporter from './components/QuizImporter';
import { 
  getQuizzes, 
  saveQuiz, 
  deleteQuiz, 
  restoreDefaultQuiz, 
  saveAttempt 
} from './utils/storage';

export default function App() {
  const [quizzes, setQuizzes] = useState(() => getQuizzes());
  const [activeQuiz, setActiveQuiz] = useState(() => quizzes[0] || null);
  const [currentTab, setCurrentTab] = useState('play'); // 'play', 'result', 'list', 'create', 'edit', 'import'
  const [quizToEdit, setQuizToEdit] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [customQuestionsSubset, setCustomQuestionsSubset] = useState(null);

  // Sync state if quizzes change
  useEffect(() => {
    if (!activeQuiz && quizzes.length > 0) {
      setActiveQuiz(quizzes[0]);
    }
  }, [quizzes, activeQuiz]);

  // Handler: select quiz to take
  const handleSelectQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCustomQuestionsSubset(null);
    setCurrentTab('play');
  };

  // Handler: start quiz test finish
  const handleFinishQuiz = (result) => {
    setQuizResult(result);
    saveAttempt(result.quizId, result);
    setCurrentTab('result');
  };

  // Handler: retake entire quiz
  const handleRetakeAll = () => {
    setCustomQuestionsSubset(null);
    setCurrentTab('play');
  };

  // Handler: retake only wrong questions
  const handleRetakeWrong = () => {
    if (!quizResult || !quizResult.details) return;
    const wrongQs = quizResult.details
      .filter(d => !d.isCorrect)
      .map(d => d.question);

    if (wrongQs.length > 0) {
      setCustomQuestionsSubset(wrongQs);
      setCurrentTab('play');
    }
  };

  // Handler: edit quiz
  const handleEditQuiz = (quiz) => {
    setQuizToEdit(quiz);
    setCurrentTab('edit');
  };

  // Handler: save quiz (create or update)
  const handleSaveQuiz = (quizData) => {
    const saved = saveQuiz(quizData);
    const updatedList = getQuizzes();
    setQuizzes(updatedList);
    setActiveQuiz(saved);
    setQuizToEdit(null);
    setCurrentTab('list');
  };

  // Handler: delete quiz
  const handleDeleteQuiz = (id) => {
    const updated = deleteQuiz(id);
    setQuizzes(updated);
    if (activeQuiz?.id === id) {
      setActiveQuiz(updated[0]);
    }
  };

  // Handler: reset MindX 50 questions default
  const handleResetMindXQuiz = () => {
    if (confirm('Khôi phục lại đề thi mẫu 50 câu chuẩn MindX từ hệ thống?')) {
      const updated = restoreDefaultQuiz();
      setQuizzes(updated);
      setActiveQuiz(updated[0]);
      alert('Đã khôi phục thành công đề thi MindX 50 câu!');
    }
  };

  // Handler: import success
  const handleImportSuccess = (importedQuiz) => {
    const saved = saveQuiz(importedQuiz);
    const updatedList = getQuizzes();
    setQuizzes(updatedList);
    setActiveQuiz(saved);
    setCustomQuestionsSubset(null);
    setCurrentTab('play');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'play') setCustomQuestionsSubset(null);
          setCurrentTab(tab);
        }}
        quizzes={quizzes}
        activeQuiz={activeQuiz}
        setActiveQuiz={(q) => {
          setActiveQuiz(q);
          setCustomQuestionsSubset(null);
        }}
        onResetMindXQuiz={handleResetMindXQuiz}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* TAB: PLAY QUIZ */}
        {currentTab === 'play' && activeQuiz && (
          <QuizPlayer 
            quiz={activeQuiz}
            initialQuestions={customQuestionsSubset}
            onFinishQuiz={handleFinishQuiz}
            onExit={() => setCurrentTab('list')}
          />
        )}

        {/* TAB: RESULT */}
        {currentTab === 'result' && quizResult && (
          <QuizResult 
            result={quizResult}
            onRetakeAll={handleRetakeAll}
            onRetakeWrong={handleRetakeWrong}
            onBackToList={() => setCurrentTab('list')}
          />
        )}

        {/* TAB: LIST */}
        {currentTab === 'list' && (
          <QuizList 
            quizzes={quizzes}
            onSelectQuiz={handleSelectQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onCreateNew={() => {
              setQuizToEdit(null);
              setCurrentTab('create');
            }}
            onOpenImport={() => setCurrentTab('import')}
            onResetMindXQuiz={handleResetMindXQuiz}
          />
        )}

        {/* TAB: CREATE QUIZ */}
        {currentTab === 'create' && (
          <QuizEditor 
            quizToEdit={null}
            onSave={handleSaveQuiz}
            onCancel={() => setCurrentTab('list')}
          />
        )}

        {/* TAB: EDIT QUIZ */}
        {currentTab === 'edit' && (
          <QuizEditor 
            quizToEdit={quizToEdit}
            onSave={handleSaveQuiz}
            onCancel={() => setCurrentTab('list')}
          />
        )}

        {/* TAB: IMPORT */}
        {currentTab === 'import' && (
          <QuizImporter 
            onImportSuccess={handleImportSuccess}
            onCancel={() => setCurrentTab('list')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        <p>MindX Quiz Master • Ứng dụng thi trắc nghiệm & Quản lý đề thi trực tuyến</p>
      </footer>

    </div>
  );
}

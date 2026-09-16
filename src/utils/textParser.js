/**
 * Smart Text Parser for Quiz format
 * Supports standard Aiken/MindX format:
 * 1. Question text
 * A. Option 1
 * B. Option 2
 * C. Option 3
 * D. Option 4
 * ANSWER: C
 * [Optional] EXPLANATION: ...
 */

export function parseQuizFromText(rawText, quizTitle = 'Đề thi nhập từ Text') {
  if (!rawText || !rawText.trim()) {
    throw new Error('Vui lòng dán nội dung văn bản đề thi cần import.');
  }

  const lines = rawText.split(/\r?\n/);
  const questions = [];
  let currentQuestion = null;
  const errors = [];

  const questionStartRegex = /^(?:(?:Câu\s+)?(\d+)[\.\:\)\/]\s*|Question\s+(\d+)[\.\:\)\/]\s*)(.*)$/i;
  const optionRegex = /^([A-Fa-f])[\.\:\)]\s*(.*)$/;
  const answerRegex = /^(?:ANSWER|Answer|ĐÁP ÁN|Đáp án|Dap an|KEY|Key|Ans)[\s\:\=]+([A-Fa-f0-9]+)/i;
  const explanationRegex = /^(?:EXPLANATION|Explanation|GIẢI THÍCH|Giải thích|Giai thich)[\s\:\=]+(.*)$/i;

  function finalizeQuestion() {
    if (!currentQuestion) return;

    if (!currentQuestion.question) {
      errors.push(`Câu số ${currentQuestion.tempId || 'chưa rõ'}: Không tìm thấy nội dung câu hỏi.`);
      currentQuestion = null;
      return;
    }

    if (currentQuestion.options.length < 2) {
      errors.push(`Câu "${currentQuestion.question.slice(0, 35)}...": Cần ít nhất 2 lựa chọn đáp án.`);
      currentQuestion = null;
      return;
    }

    if (currentQuestion.correctIndex === -1) {
      errors.push(`Câu "${currentQuestion.question.slice(0, 35)}...": Chưa xác định được đáp án đúng (thiếu dòng ANSWER: ...).`);
      // Default to 0 so it still imports if user wants
      currentQuestion.correctIndex = 0;
    }

    questions.push({
      id: questions.length + 1,
      question: currentQuestion.question.trim(),
      options: currentQuestion.options.map(opt => opt.trim()),
      correctIndex: currentQuestion.correctIndex,
      explanation: currentQuestion.explanation ? currentQuestion.explanation.trim() : '',
      timeSeconds: 30
    });

    currentQuestion = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Check if line is ANSWER
    const ansMatch = line.match(answerRegex);
    if (ansMatch && currentQuestion) {
      const ansKey = ansMatch[1].trim().toUpperCase();
      let index = -1;
      if (/^[A-F]$/.test(ansKey)) {
        index = ansKey.charCodeAt(0) - 65; // 'A' -> 0
      } else if (/^\d+$/.test(ansKey)) {
        index = parseInt(ansKey, 10) - 1;
      }
      if (index >= 0) {
        currentQuestion.correctIndex = index;
      }
      continue;
    }

    // Check if line is EXPLANATION
    const expMatch = line.match(explanationRegex);
    if (expMatch && currentQuestion) {
      currentQuestion.explanation = expMatch[1].trim();
      continue;
    }

    // Check if line is Option (A., B., C., D.)
    const optMatch = line.match(optionRegex);
    if (optMatch && currentQuestion && currentQuestion.question) {
      const letter = optMatch[1].toUpperCase();
      const text = optMatch[2].trim();
      currentQuestion.options.push(text);
      continue;
    }

    // Check if line is a New Question
    const qMatch = line.match(questionStartRegex);
    if (qMatch) {
      finalizeQuestion();
      const qNum = qMatch[1] || qMatch[2];
      const qText = qMatch[3].trim();
      currentQuestion = {
        tempId: qNum,
        question: qText,
        options: [],
        correctIndex: -1,
        explanation: ''
      };
      continue;
    }

    // If currentQuestion exists, could be multi-line question text or explanation
    if (currentQuestion) {
      if (currentQuestion.options.length === 0) {
        // Multi-line question title
        currentQuestion.question += ' ' + line;
      } else if (currentQuestion.explanation !== undefined && currentQuestion.explanation !== '') {
        currentQuestion.explanation += ' ' + line;
      } else {
        // Multi-line option text for the last added option
        const lastIdx = currentQuestion.options.length - 1;
        currentQuestion.options[lastIdx] += ' ' + line;
      }
    }
  }

  // Finalize last question
  finalizeQuestion();

  if (questions.length === 0) {
    throw new Error('Không thể nhận diện được câu hỏi nào từ văn bản. Vui lòng kiểm tra định dạng mẫu: \n1. Câu hỏi\nA. Đáp án A\nB. Đáp án B\nANSWER: A');
  }

  return {
    quiz: {
      id: 'quiz-' + Date.now(),
      title: quizTitle || `Đề thi trắc nghiệm (${questions.length} câu)`,
      description: `Được nhập từ định dạng Text vào lúc ${new Date().toLocaleString('vi-VN')}`,
      timeLimitMinutes: Math.max(10, Math.ceil((questions.length * 45) / 60)),
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions
    },
    errors
  };
}

/**
 * Export quiz to text format
 */
export function exportQuizToText(quiz) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) return '';
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const blocks = quiz.questions.map((q, idx) => {
    const qHeader = `${idx + 1}. ${q.question}`;
    const opts = (q.options || []).map((opt, oIdx) => `${LETTERS[oIdx] || '?'}. ${opt}`).join('\n');
    const ansLetter = LETTERS[q.correctIndex] || 'A';
    let block = `${qHeader}\n${opts}\nANSWER: ${ansLetter}`;
    if (q.explanation) {
      block += `\nGIẢI THÍCH: ${q.explanation}`;
    }
    return block;
  });

  return blocks.join('\n\n');
}

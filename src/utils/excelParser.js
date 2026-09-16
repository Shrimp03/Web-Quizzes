import * as XLSX from 'xlsx';

/**
 * Parse an Excel ArrayBuffer or file to Quiz format
 */
export async function parseQuizFromExcel(fileOrBuffer, defaultTitle = 'Đề thi từ Excel') {
  let workbook;
  if (fileOrBuffer instanceof ArrayBuffer || ArrayBuffer.isView(fileOrBuffer)) {
    workbook = XLSX.read(fileOrBuffer, { type: 'array' });
  } else if (fileOrBuffer instanceof File) {
    const buffer = await fileOrBuffer.arrayBuffer();
    workbook = XLSX.read(buffer, { type: 'array' });
  } else {
    throw new Error('Định dạng file không hợp lệ.');
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('File Excel không có bất kỳ trang tính (sheet) nào.');
  }

  // Priority to Quizizz_Import sheet if available, otherwise first sheet
  const sheetName = workbook.SheetNames.includes('Quizizz_Import')
    ? 'Quizizz_Import'
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length < 2) {
    throw new Error(`Sheet "${sheetName}" không có đủ dữ liệu câu hỏi.`);
  }

  const headerRow = rawRows[0].map(h => String(h || '').trim().toLowerCase());
  const questions = [];
  const errors = [];

  // Check if it's Quizizz format
  const isQuizizzFormat = headerRow.some(h => h.includes('question text') || h.includes('option 1'));

  if (isQuizizzFormat) {
    // Map Quizizz columns
    const qCol = headerRow.findIndex(h => h.includes('question text'));
    const opt1Col = headerRow.findIndex(h => h.includes('option 1'));
    const opt2Col = headerRow.findIndex(h => h.includes('option 2'));
    const opt3Col = headerRow.findIndex(h => h.includes('option 3'));
    const opt4Col = headerRow.findIndex(h => h.includes('option 4'));
    const opt5Col = headerRow.findIndex(h => h.includes('option 5'));
    const correctCol = headerRow.findIndex(h => h.includes('correct answer') || h.includes('đáp án đúng'));
    const expCol = headerRow.findIndex(h => h.includes('answer explanation') || h.includes('giải thích') || h.includes('explanation'));

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || !row[qCol] || String(row[qCol]).trim() === '') continue;

      const qText = String(row[qCol]).trim();
      const options = [];
      [opt1Col, opt2Col, opt3Col, opt4Col, opt5Col].forEach(col => {
        if (col !== -1 && row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') {
          options.push(String(row[col]).trim());
        }
      });

      if (options.length < 2) {
        errors.push(`Dòng ${i + 1}: Câu hỏi "${qText.slice(0, 30)}..." không có đủ 2 lựa chọn.`);
        continue;
      }

      let correctIndex = 0;
      const rawCorrect = row[correctCol];
      if (typeof rawCorrect === 'number') {
        correctIndex = rawCorrect - 1;
      } else if (rawCorrect !== undefined && rawCorrect !== null) {
        const valStr = String(rawCorrect).trim();
        const num = parseInt(valStr, 10);
        if (!isNaN(num)) {
          correctIndex = num - 1;
        } else {
          const letter = valStr.toUpperCase();
          const letterMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
          if (letterMap[letter] !== undefined) correctIndex = letterMap[letter];
        }
      }

      if (correctIndex < 0 || correctIndex >= options.length) {
        correctIndex = 0;
      }

      const explanation = expCol !== -1 && row[expCol] ? String(row[expCol]).trim() : '';

      questions.push({
        id: questions.length + 1,
        question: qText,
        options,
        correctIndex,
        explanation,
        timeSeconds: 30
      });
    }
  } else {
    // Generic Table format
    // Try to detect columns
    const qCol = headerRow.findIndex(h => h.includes('câu hỏi') || h.includes('question') || h.includes('nội dung'));
    const optACol = headerRow.findIndex(h => h === 'a' || h.includes('đáp án a') || h.includes('lựa chọn a') || h.includes('option a'));
    const optBCol = headerRow.findIndex(h => h === 'b' || h.includes('đáp án b') || h.includes('lựa chọn b') || h.includes('option b'));
    const optCCol = headerRow.findIndex(h => h === 'c' || h.includes('đáp án c') || h.includes('lựa chọn c') || h.includes('option c'));
    const optDCol = headerRow.findIndex(h => h === 'd' || h.includes('đáp án d') || h.includes('lựa chọn d') || h.includes('option d'));
    const correctCol = headerRow.findIndex(h => h.includes('đáp án đúng') || h.includes('đáp án') || h.includes('answer') || h.includes('correct'));
    const expCol = headerRow.findIndex(h => h.includes('giải thích') || h.includes('explanation'));

    const questionIndex = qCol !== -1 ? qCol : 1; // Fallback col 1

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || !row[questionIndex] || String(row[questionIndex]).trim() === '') continue;

      const qText = String(row[questionIndex]).trim();
      const options = [];

      const targetCols = [optACol, optBCol, optCCol, optDCol].filter(c => c !== -1);
      if (targetCols.length >= 2) {
        targetCols.forEach(col => {
          if (row[col] !== undefined && String(row[col]).trim() !== '') {
            options.push(String(row[col]).trim());
          }
        });
      } else {
        // Fallback: take columns 2, 3, 4, 5
        for (let col = 2; col <= 5; col++) {
          if (row[col] !== undefined && String(row[col]).trim() !== '') {
            options.push(String(row[col]).trim());
          }
        }
      }

      if (options.length < 2) continue;

      let correctIndex = 0;
      if (correctCol !== -1 && row[correctCol] !== undefined) {
        const val = String(row[correctCol]).trim().toUpperCase();
        if (/^[A-D]/.test(val)) {
          correctIndex = val.charCodeAt(0) - 65;
        } else {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num > 0) correctIndex = num - 1;
        }
      }

      const explanation = expCol !== -1 && row[expCol] ? String(row[expCol]).trim() : '';

      questions.push({
        id: questions.length + 1,
        question: qText,
        options,
        correctIndex: Math.max(0, Math.min(correctIndex, options.length - 1)),
        explanation,
        timeSeconds: 30
      });
    }
  }

  if (questions.length === 0) {
    throw new Error('Không trích xuất được câu hỏi hợp lệ từ file Excel.');
  }

  return {
    quiz: {
      id: 'quiz-excel-' + Date.now(),
      title: defaultTitle,
      description: `Import từ file Excel (${sheetName}) - ${questions.length} câu hỏi`,
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
 * Export quiz to Excel (.xlsx) Quizizz/Wayground compatible
 */
export function exportQuizToExcel(quiz) {
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  // Sheet 1: Quizizz_Import
  const headers = [
    'Question Text',
    'Question Type',
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Option 5',
    'Correct Answer',
    'Time in seconds',
    'Image Link',
    'Answer explanation'
  ];

  const rows = [headers];

  // Sheet 2: Dap_an
  const ansHeaders = ['STT', 'Câu hỏi', 'Đáp án đúng', 'Giải thích'];
  const ansRows = [ansHeaders];

  (quiz.questions || []).forEach((q, idx) => {
    const opt1 = q.options[0] || '';
    const opt2 = q.options[1] || '';
    const opt3 = q.options[2] || '';
    const opt4 = q.options[3] || '';
    const opt5 = q.options[4] || '';
    const correctNum = (q.correctIndex || 0) + 1;

    rows.push([
      q.question,
      'Multiple Choice',
      opt1,
      opt2,
      opt3,
      opt4,
      opt5,
      correctNum,
      q.timeSeconds || 30,
      q.image || '',
      q.explanation || ''
    ]);

    const correctText = `${LETTERS[q.correctIndex] || 'A'}. ${q.options[q.correctIndex] || ''}`;
    ansRows.push([
      idx + 1,
      q.question,
      correctText,
      q.explanation || ''
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(rows);
  const ws2 = XLSX.utils.aoa_to_sheet(ansRows);

  // Set column widths
  ws1['!cols'] = [
    { wch: 45 }, { wch: 15 }, { wch: 25 }, { wch: 25 },
    { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Quizizz_Import');
  XLSX.utils.book_append_sheet(wb, ws2, 'Dap_an');

  const fileName = `${quiz.title.replace(/[\\/:*?"<>|]/g, '_')}_export.xlsx`;
  XLSX.writeFile(wb, fileName);
}

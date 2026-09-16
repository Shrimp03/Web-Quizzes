# 🎯 MindX Quiz Master - Hệ thống Trắc nghiệm & Quản lý Đề thi

Ứng dụng web ReactJS hiện đại hỗ trợ ôn luyện trắc nghiệm chuyên môn MindX, làm bài thi tính giờ, tạo mới & cập nhật đề thi, và nhập đề siêu tốc từ file Text hoặc file Excel (.xlsx).

---

## 🚀 Cách khởi động ứng dụng

Đảm bảo bạn đang ở thư mục dự án `d:\MindX`:

```bash
# Cài đặt thư viện (nếu cần)
npm install

# Chạy server phát triển
npm run dev
```

Truy cập trên trình duyệt: **`http://localhost:5173`**

---

## ✨ Các tính năng nổi bật

### 1. Làm bài thi & Ôn luyện trắc nghiệm
- **Chế độ Ôn luyện (Tức thì)**: Chọn đáp án hiển thị ngay **Đúng (Xanh)** / **Sai (Đỏ)**, kèm đáp án đúng và **Giải thích chi tiết** lý do.
- **Chế độ Thi tính giờ**: Đồng hồ đếm ngược (45 phút hoặc thời lượng tùy chỉnh), đánh dấu câu hỏi cần xem lại (**Ghim cờ**), nộp bài tổng kết.
- **Bảng điều hướng 50 câu hỏi**: Nhảy nhanh đến bất kỳ câu hỏi nào với mã màu trực quan (đã làm, chưa làm, ghim cờ, đúng/sai).
- **Tùy chọn xáo trộn**: Đảo ngẫu nhiên thứ tự câu hỏi để rèn luyện trí nhớ logic.

### 2. Kết quả & Ôn tập thông minh
- Thang điểm 10 và tỷ lệ phần trăm (%), phân loại xếp loại (Xuất sắc, Đạt yêu cầu, Cần ôn thêm).
- Hiệu ứng pháo hoa (Confetti) khi đạt điểm cao (≥ 80%).
- Bộ lọc câu hỏi: Xem tất cả / Chỉ xem câu sai / Chỉ xem câu đúng.
- **Tính năng đặc biệt: "Ôn lại các câu sai"** - Tự động tạo bài làm lại chỉ gồm những câu bạn đã chọn sai để khắc sâu kiến thức!

### 3. Quản lý Đề thi (CRUD)
- Quản lý danh sách các đề thi được lưu trữ cục bộ (LocalStorage).
- **Tạo đề thi mới**: Nhập tên đề, mô tả, thời gian làm bài, thêm từng câu hỏi, các lựa chọn A/B/C/D, chọn đáp án đúng và nhập lời giải thích.
- **Cập nhật đề thi**: Chỉnh sửa câu hỏi, thêm bớt phương án lựa chọn, sửa đáp án bất cứ lúc nào.
- **Xuất đề thi**: Xuất ra file Excel (.xlsx) chuẩn Quizizz/Wayground hoặc xuất ra file Text (.txt).
- **Khôi phục đề chuẩn MindX**: Bấm nút ⚡ Khôi phục bất cứ lúc nào để nạp lại 50 câu hỏi gốc.

### 4. Nhập đề siêu tốc (Import)
- **Import từ File Excel (.xlsx)**:
  - Hỗ trợ trực tiếp file `MindX_50_cau_Quizizz_Wayground.xlsx` hoặc bất kỳ file nào có sheet `Quizizz_Import` hay bảng câu hỏi A, B, C, D.
  - Tự động nhận diện cột câu hỏi, 5 lựa chọn, đáp án đúng và cột giải thích.
  - Nút bấm nhanh: *⚡ Nạp file Excel MindX có sẵn*.
- **Import từ Text (Mẫu đề bài)**:
  - Nhập trực tiếp dạng:
    ```text
    1. Kiểm tra chuyên môn đầu vào kéo dài bao lâu?
    A. 30 phút
    B. 40 phút
    C. 45 phút
    D. 60 phút
    ANSWER: C
    GIẢI THÍCH: Kiểm tra chuyên môn đầu vào được thực hiện trong 45 phút.
    ```
  - Hỗ trợ các biến thể: `ANSWER: C`, `Answer: C`, `ĐÁP ÁN: C`, `Đáp án: C`, `Key: C`.
  - Có sẵn nút *"Dán mẫu thử nghiệm"* để test nhanh.

---

## 📂 Cấu trúc thư mục

```
d:/MindX/
├── public/
│   └── MindX_50_cau_Quizizz_Wayground.xlsx
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Thanh điều hướng và chọn đề
│   │   ├── QuizPlayer.jsx       # Giao diện làm bài thi & luyện tập
│   │   ├── QuizResult.jsx       # Màn hình kết quả & xem lại câu sai
│   │   ├── QuizList.jsx         # Quản lý danh sách đề thi (CRUD)
│   │   ├── QuizEditor.jsx       # Trình tạo mới & chỉnh sửa câu hỏi
│   │   └── QuizImporter.jsx     # Trình import từ file Excel / Text
│   ├── data/
│   │   ├── defaultQuiz.js       # Dữ liệu chuẩn 50 câu trích xuất từ Excel
│   │   └── mindx_50_questions.json
│   ├── utils/
│   │   ├── excelParser.js       # Đọc/ghi file Excel (.xlsx) với SheetJS
│   │   ├── textParser.js        # Phân tích cú pháp văn bản câu hỏi
│   │   └── storage.js           # Quản lý LocalStorage
│   ├── App.jsx                  # Điều hướng chính
│   ├── index.css                # Tailwind CSS
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

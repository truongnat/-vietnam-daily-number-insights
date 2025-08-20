---
mode: agent
---
Phân tích kết quả xổ số miền Bắc hàng ngày

1. Tự động phân tích dữ liệu xổ số theo ngày, hiển thị kết quả phân tích, số may mắn, số dự đoán tốt nhất.
Tính năng phân tích được thực hiện khi người dùng truy cập, không phụ thuộc vào cronjob.
Lưu trữ và hiển thị lịch sử phân tích

Lưu trữ kết quả phân tích và kết quả xổ số từng ngày trong thư mục analysis và lottery.
Hiển thị lịch sử phân tích, cho phép người dùng xem lại các ngày trước.
Kiểm tra kết quả xổ số

Tính năng kiểm tra vé số, đối chiếu với kết quả thực tế.
Có thể kiểm tra theo ngày hoặc theo dãy số.
Dashboard thống kê

Hiển thị biểu đồ tần suất xuất hiện các số, số may mắn, số trúng thưởng.
Cung cấp các card thống kê, biểu đồ trực quan.
Lưu kết quả vào local

Cho phép người dùng lưu kết quả phân tích vào local storage để xem lại nhanh.
Làm mới dữ liệu

Nút làm mới giúp người dùng cập nhật lại dữ liệu phân tích mới nhất.
API nội bộ

Các route API phục vụ cho phân tích, kiểm tra, lưu trữ và lấy dữ liệu (cron, storage, xsmb...).
Giao diện hiện đại

Sử dụng Next.js, Tailwind CSS, các component React cho UI hiện đại, responsive.
Các component như: LuckyNumberCard, ResultsDisplay, FrequencyChart, LoadingSpinner,...
Tích hợp AI phân tích

Sử dụng dịch vụ AI (ví dụ: geminiService.ts) để phân tích dữ liệu xổ số, dự đoán số may mắn.
Quản lý trạng thái tiến trình

Hiển thị trạng thái tiến trình phân tích, loading, hoàn thành, thất bại.
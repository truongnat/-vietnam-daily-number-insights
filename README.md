# 🎯 Vietnam Daily Number Insights

**Ứng dụng phân tích tin tức và dự đoán số may mắn hàng ngày cho thị trường Việt Nam**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/vietnam-daily-number-insights)

## 🌐 Live Demo

**🔗 [https://vietnam-daily-number-insights.vercel.app/](https://vietnam-daily-number-insights.vercel.app/)**

## ✨ Tính năng chính

### 🤖 AI-Powered Analysis
- **Phân tích tin tức** tự động từ các nguồn Việt Nam
- **Gemini AI** để xử lý và phân tích dữ liệu
- **Dự đoán thông minh** dựa trên xu hướng và sự kiện

### 🎲 Số May Mắn Hàng Ngày
- **1 Số Đề May Mắn Nhất** - Tỷ lệ cao trúng giải đặc biệt
- **4 Số Lô Tiềm Năng** - Tỷ lệ cao trúng các giải khác
- **Phân tích chi tiết** lý do chọn từng số

### 📊 Đối Chiếu Kết Quả
- **Tự động kiểm tra** kết quả xổ số hàng ngày
- **Thống kê chính xác** tỷ lệ trúng
- **Lịch sử đầy đủ** các dự đoán và kết quả

### 📈 Dashboard & Analytics
- **Biểu đồ tần suất** các con số
- **Thống kê hiệu suất** theo thời gian
- **Lịch sử phân tích** chi tiết

### ⏰ Tự Động Hóa
- **3 lần phân tích/ngày**: 12:00, 16:00, 17:00
- **Kiểm tra kết quả**: 19:00 hàng ngày
- **Cron jobs** với cron-job.org (miễn phí, không cần API key)

## 🛠️ Công Nghệ

### Frontend
- **Next.js 15.4.5** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Hooks** - State management

### Backend
- **Next.js API Routes** - Server-side logic
- **JSON File Storage** - Database replacement
- **Gemini AI API** - News analysis
- **Cron Jobs** - Automated tasks

### Deployment
- **Vercel** - Hosting platform
- **cron-job.org** - External cron service
- **Environment Variables** - Configuration

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **pnpm** (recommended) hoặc npm
- **Gemini API Key**

### 1. Clone Repository
```bash
git clone https://github.com/your-username/vietnam-daily-number-insights.git
cd vietnam-daily-number-insights
```

### 2. Install Dependencies
```bash
pnpm install
# hoặc
npm install
```

### 3. Environment Setup
Tạo file `.env.local`:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
CRON_SECRET=your-secure-random-string
```

### 4. Run Development Server
```bash
pnpm dev
# hoặc
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu Trúc Dự Án

```
vietnam-daily-number-insights/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── cron/                 # Cron job endpoints
│   │   └── storage/              # Data storage APIs
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/                   # React components
│   ├── LuckyNumberCard.tsx       # Số may mắn display
│   ├── ResultsDisplay.tsx        # Kết quả phân tích
│   ├── LotteryResultDisplay.tsx  # Đối chiếu xổ số
│   └── ...                       # Các components khác
├── services/                     # Business logic
│   └── geminiService.ts          # Gemini AI integration
├── utils/                        # Utilities
│   ├── database.ts               # JSON storage
│   └── storage.ts                # Data operations
├── types.ts                      # TypeScript definitions
├── data/                         # JSON database
│   └── vietnam-insights.json     # Stored data
├── CRON_SETUP.md                 # Cron setup guide
└── CRON_QUICK_SETUP.md           # Quick setup guide
```

## 🔧 Deployment

### Deploy to Vercel

1. **Fork repository** này về GitHub của bạn
2. **Connect với Vercel**:
   - Vào [vercel.com](https://vercel.com)
   - Import GitHub repository
3. **Set Environment Variables**:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```
4. **Deploy** - Vercel sẽ tự động build và deploy

### Setup Cron Jobs (Miễn phí)

Sau khi deploy, setup cron jobs với cron-job.org:

1. **Đọc hướng dẫn**: [`CRON_QUICK_SETUP.md`](CRON_QUICK_SETUP.md)
2. **Đăng ký miễn phí** tại [cron-job.org](https://cron-job.org) (không cần API key)
3. **Tạo 4 cron jobs** qua giao diện web (chỉ cần URL + schedule)
4. **Test endpoints** để đảm bảo hoạt động

**Lưu ý**: Cron-job.org hoàn toàn miễn phí và không yêu cầu API key, authentication hay thông tin thanh toán.

## 📊 API Endpoints

### Public Endpoints
- `GET /api/storage/analysis/[date]` - Lấy phân tích theo ngày
- `GET /api/storage/historical` - Lấy lịch sử phân tích
- `GET /api/storage/lottery/[date]` - Lấy kết quả xổ số

### Cron Endpoints (Public)
- `GET /api/cron/daily-analysis` - Chạy phân tích hàng ngày
- `GET /api/cron/lottery-check` - Kiểm tra kết quả xổ số

**Authentication**: Không cần authentication

## 🎯 Cách Sử Dụng

### 1. Xem Số May Mắn Hôm Nay
- Truy cập trang chủ
- Xem **Số Đề May Mắn Nhất** (card vàng lớn)
- Xem **4 Số Lô Tiềm Năng** (grid nhỏ)

### 2. Đọc Phân Tích Chi Tiết
- Scroll xuống xem **Các Con Số Nổi Bật**
- Đọc **Nguồn Sự Kiện Chính**
- Hiểu lý do AI chọn các số

### 3. Kiểm Tra Lịch Sử
- Click **"Xem Lịch Sử"**
- Xem các dự đoán trước đó
- Kiểm tra tỷ lệ trúng thực tế

### 4. Đối Chiếu Kết Quả
- Sau 19:00 hàng ngày
- Hệ thống tự động đối chiếu
- Hiển thị kết quả trúng/trượt

## 🔒 Bảo Mật

- **API Key Protection**: Gemini API key được bảo vệ server-side
- **Cron Authentication**: CRON_SECRET để bảo vệ endpoints
- **Environment Variables**: Sensitive data không expose
- **Rate Limiting**: Tự nhiên qua cron schedule

## 📈 Performance

- **Static Generation**: Next.js pre-renders pages
- **API Caching**: Intelligent caching strategies
- **JSON Storage**: Fast file-based database
- **CDN**: Vercel Edge Network
- **Optimized Images**: Next.js Image optimization

## 🐛 Troubleshooting

### Common Issues

**1. Không có dữ liệu hiển thị:**
- Kiểm tra cron jobs đã chạy chưa
- Verify GEMINI_API_KEY trong Vercel
- Check logs trong Vercel dashboard

**2. Cron jobs không hoạt động:**
- Kiểm tra cron-job.org setup
- Verify CRON_SECRET matches
- Check execution history

**3. Build errors:**
```bash
pnpm run build
# Kiểm tra TypeScript errors
```

### Debug Commands
```bash
# Test API locally
curl http://localhost:3000/api/storage/historical

# Test cron endpoint
curl http://localhost:3000/api/cron/daily-analysis

# Check build
pnpm run build
```

## 🤝 Contributing

1. **Fork** repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - Powerful AI analysis
- **Next.js Team** - Amazing React framework
- **Vercel** - Seamless deployment platform
- **cron-job.org** - Reliable cron service
- **Tailwind CSS** - Beautiful styling system

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/vietnam-daily-number-insights/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vietnam-daily-number-insights/discussions)
- **Email**: your-email@example.com

---

**🎯 Made with ❤️ for the Vietnamese community**

**⭐ Star this repo if you find it useful!**

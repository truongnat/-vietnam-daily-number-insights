# ⚡ Quick Setup: Cron-job.org

Hướng dẫn nhanh thay thế Vercel cron bằng cron-job.org cho **Vietnam Daily Number Insights**.

## 🎯 Mục tiêu
- ✅ Thay thế Vercel cron (đã xóa khỏi vercel.json)
- ✅ Sử dụng cron-job.org miễn phí (không cần API key)
- ✅ 4 jobs: 3 daily analysis + 1 lottery check

## 💡 Tại sao cron-job.org?
- **Hoàn toàn miễn phí** - Không cần API key, credit card
- **Giao diện web** - Tạo và quản lý jobs dễ dàng
- **Reliable** - Uptime cao, monitoring tốt
- **No limits** - Không giới hạn số jobs như Vercel

## 🚀 Setup nhanh (5 phút)

### 1. Đăng ký (Miễn phí - Không cần API key)
- Vào [cron-job.org](https://cron-job.org)
- Đăng ký tài khoản miễn phí (chỉ cần email)
- **Không cần** API key hay payment method

### 2. Tạo 4 jobs

**Thay `your-domain.vercel.app` và `your-secret-token` bằng giá trị thực:**

#### Job 1: Analysis 12:00
```
Title: Vietnam Analysis 12:00
URL: https://your-domain.vercel.app/api/cron/daily-analysis
Schedule: 0 5 * * *
Method: POST
Headers: Authorization: Bearer your-secret-token
```

#### Job 2: Analysis 16:00
```
Title: Vietnam Analysis 16:00
URL: https://your-domain.vercel.app/api/cron/daily-analysis
Schedule: 0 9 * * *
Method: POST
Headers: Authorization: Bearer your-secret-token
```

#### Job 3: Analysis 17:00
```
Title: Vietnam Analysis 17:00
URL: https://your-domain.vercel.app/api/cron/daily-analysis
Schedule: 0 10 * * *
Method: POST
Headers: Authorization: Bearer your-secret-token
```

#### Job 4: Lottery 19:00
```
Title: Vietnam Lottery Check
URL: https://your-domain.vercel.app/api/cron/lottery-check
Schedule: 0 12 * * *
Method: POST
Headers: Authorization: Bearer your-secret-token
```

### 3. Test
- Click "Execute now" cho từng job
- Kiểm tra response: `{"success": true, ...}`

### 4. Bật notifications
- Settings → Notifications
- Enable email cho failed executions

## 🔑 Lấy thông tin cần thiết

### Domain của bạn:
```bash
# Kiểm tra trong Vercel dashboard
# Hoặc file .env.local
echo $VERCEL_URL
```

### CRON_SECRET:
```bash
# Kiểm tra trong Vercel → Settings → Environment Variables
# Hoặc tạo mới nếu chưa có
openssl rand -base64 32
```

## ✅ Checklist
- [ ] Đăng ký cron-job.org
- [ ] Tạo 4 jobs với đúng URL và headers
- [ ] Test thành công tất cả jobs
- [ ] Bật email notifications
- [ ] Xóa vercel.json cron config (✅ đã xong)

## 🆘 Nếu có lỗi
- **401**: Sai CRON_SECRET
- **500**: Kiểm tra logs Vercel
- **Timeout**: Bình thường, Gemini API chậm

**📖 Chi tiết đầy đủ:** Xem file `CRON_SETUP.md`

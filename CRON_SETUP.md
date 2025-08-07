# 🕐 Cron-job.org Setup Guide

Hướng dẫn thiết lập cron jobs cho **Vietnam Daily Number Insights** sử dụng [cron-job.org](https://cron-job.org).

## 📋 Tổng quan

Thay thế Vercel cron jobs bằng cron-job.org để có:
- ✅ **Miễn phí** hoàn toàn (không cần API key)
- ✅ **Giao diện web** dễ quản lý
- ✅ **Monitoring** chi tiết
- ✅ **Email notifications** khi có lỗi
- ✅ **Logs** đầy đủ
- ✅ **Không giới hạn** số lượng cron jobs
- ✅ **Reliable** với uptime cao

## 🔍 Cron-job.org là gì?

**Cron-job.org** là dịch vụ web miễn phí cho phép bạn:
- **Tạo cron jobs** qua giao diện web (không cần server riêng)
- **Gọi HTTP requests** theo lịch trình định sẵn
- **Monitor execution** với logs chi tiết
- **Nhận notifications** qua email khi có lỗi

**Cách hoạt động:**
1. Bạn tạo cron job trên cron-job.org
2. Cron-job.org sẽ gọi HTTP request đến API của bạn theo lịch
3. API của bạn xử lý và trả về response
4. Cron-job.org log kết quả và gửi notification nếu cần

**So sánh với Vercel cron:**
- ✅ **Miễn phí** (Vercel cron cần Pro plan)
- ✅ **Không giới hạn** số jobs
- ✅ **Giao diện quản lý** trực quan
- ✅ **Monitoring** tốt hơn

Ứng dụng có 2 cron jobs chính:
1. **Daily Analysis** - Chạy 1 lần/ngày: 12:00 (Vietnam time)
2. **Lottery Check** - Chạy lúc 19:00 (Vietnam time)

## 🔧 Cấu hình cần thiết

### 1. Environment Variables

Đảm bảo có biến môi trường sau trong Vercel:

```bash
GEMINI_API_KEY=your-gemini-api-key
```

### 2. API Endpoints

#### Daily Analysis (`/api/cron/daily-analysis`)
- **Mục đích**: Phân tích tin tức và tạo số may mắn
- **Lịch trình**: 12:00 Vietnam time (GMT+7)
- **Method**: GET
- **Authentication**: Không cần

#### Lottery Check (`/api/cron/lottery-check`)
- **Mục đích**: Lấy kết quả xổ số và lưu vào database
- **Lịch trình**: 19:00 Vietnam time (GMT+7) - sau khi có kết quả
- **Method**: GET
- **Authentication**: Không cần

## 📅 Lịch trình cron jobs

### Job 1: Daily Analysis (3 lần/ngày)

**Thời gian Vietnam:** 12:00, 16:00, 17:00
**Thời gian UTC:** 05:00, 09:00, 10:00

**Cấu hình cron-job.org:**
```
Title: Vietnam Daily Analysis - 12:00
URL: https://your-domain.vercel.app/api/cron/daily-analysis
Method: GET
Schedule: 0 5 * * *
```

```
Title: Vietnam Daily Analysis - 16:00
URL: https://your-domain.vercel.app/api/cron/daily-analysis
Method: GET
Schedule: 0 9 * * *
```

```
Title: Vietnam Daily Analysis - 17:00
URL: https://your-domain.vercel.app/api/cron/daily-analysis
Method: GET
Schedule: 0 10 * * *
```

### Job 2: Lottery Check

**Thời gian Vietnam:** 19:00
**Thời gian UTC:** 12:00

**Cấu hình cron-job.org:**
```
Title: Vietnam Lottery Check
URL: https://your-domain.vercel.app/api/cron/lottery-check
Method: GET
Schedule: 0 12 * * *
```

## 🚀 Hướng dẫn setup từng bước

### Bước 1: Đăng ký tài khoản (Hoàn toàn miễn phí)

1. Truy cập [cron-job.org](https://cron-job.org)
2. Đăng ký tài khoản miễn phí (chỉ cần email + password)
3. Xác nhận email
4. **Lưu ý**: Không cần API key, credit card hay payment method

### Bước 2: Tạo cron jobs

1. **Đăng nhập** vào cron-job.org
2. Click **"Create cronjob"**
3. Điền thông tin cho từng job:

#### Job 1: Daily Analysis 12:00
- **Title:** `Vietnam Daily Analysis - 12:00`
- **URL:** `https://your-domain.vercel.app/api/cron/daily-analysis`
- **Schedule:** `0 5 * * *` (UTC)
- **Request method:** `GET`
- **Request headers:** Không cần
- **Enable:** ✅

#### Job 2: Daily Analysis 16:00
- **Title:** `Vietnam Daily Analysis - 16:00`
- **URL:** `https://your-domain.vercel.app/api/cron/daily-analysis`
- **Schedule:** `0 9 * * *` (UTC)
- **Request method:** `GET`
- **Request headers:** Không cần
- **Enable:** ✅

#### Job 3: Daily Analysis 17:00
- **Title:** `Vietnam Daily Analysis - 17:00`
- **URL:** `https://your-domain.vercel.app/api/cron/daily-analysis`
- **Schedule:** `0 10 * * *` (UTC)
- **Request method:** `GET`
- **Request headers:** Không cần
- **Enable:** ✅

#### Job 4: Lottery Check 19:00
- **Title:** `Vietnam Lottery Check`
- **URL:** `https://your-domain.vercel.app/api/cron/lottery-check`
- **Schedule:** `0 12 * * *` (UTC)
- **Request method:** `GET`
- **Request headers:** Không cần
- **Enable:** ✅

### Bước 3: Cấu hình notifications

1. Vào **Settings** → **Notifications**
2. Bật **Email notifications** cho:
   - ✅ Failed executions
   - ✅ Disabled cronjobs
3. Nhập email để nhận thông báo

### Bước 4: Test thử

1. Click **"Execute now"** cho từng job
2. Kiểm tra **Execution history**
3. Xem response để đảm bảo hoạt động đúng

## 📊 Monitoring & Logs

### Kiểm tra execution history:
- Vào dashboard cron-job.org
- Click vào từng job để xem chi tiết
- Kiểm tra response codes và messages

### Response thành công:
```json
{
  "success": true,
  "message": "Daily analysis completed at 12:00",
  "dateKey": "2025-07-31",
  "bestNumber": "25",
  "luckyNumbers": ["12", "34", "56", "78"]
}
```

### Response lỗi:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🔒 Bảo mật

- ✅ **Endpoints công khai** - Không cần authentication
- ✅ **Đơn giản** - Chỉ cần URL để gọi
- ✅ **An toàn** - Chỉ thực hiện read operations
- ✅ **Logs** không chứa sensitive data

## 🧪 Test thử manual

```bash
# Test daily analysis
curl https://your-domain.vercel.app/api/cron/daily-analysis

# Test lottery check
curl https://your-domain.vercel.app/api/cron/lottery-check

# Hoặc mở trực tiếp trên browser:
# https://your-domain.vercel.app/api/cron/daily-analysis
# https://your-domain.vercel.app/api/cron/lottery-check
```

## 🆘 Troubleshooting

### Lỗi 500 Internal Server Error:
- Kiểm tra logs trong Vercel
- Có thể do API key Gemini hết quota

### Job không chạy:
- Kiểm tra timezone (UTC vs Vietnam)
- Đảm bảo job được enable
- Kiểm tra URL endpoint

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra execution history trong cron-job.org
2. Xem logs trong Vercel dashboard
3. Test manual bằng cách gọi API trực tiếp

## ✅ Checklist hoàn thành

- [ ] Đăng ký tài khoản cron-job.org
- [ ] Tạo 4 cron jobs (3 daily analysis + 1 lottery check)
- [ ] Cấu hình URL và schedule cho từng job
- [ ] Bật email notifications
- [ ] Test thử từng job
- [ ] Kiểm tra execution history
- [ ] Xóa cấu hình Vercel cron (đã hoàn thành)

**🎉 Sau khi hoàn thành, bạn sẽ có hệ thống cron jobs miễn phí và đáng tin cậy!**
4. **Rate Limiting**: Be aware of Gemini API rate limits if running multiple instances

### Logs

Check your deployment platform's logs for detailed error information:
- Vercel: Check Function Logs in the dashboard
- Other platforms: Check application logs or container logs

## Security Notes

- Cron endpoints are public but safe (read-only operations)
- No sensitive data exposed through these endpoints
- Consider monitoring for unusual activity if needed
- GEMINI_API_KEY remains secure on server-side

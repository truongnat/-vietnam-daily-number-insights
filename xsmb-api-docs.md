# XSMB API Documentation

API để cào kết quả xổ số miền Bắc từ xoso.com.vn và trả về dữ liệu JSON có cấu trúc

## Base URL
https://v0-next-js-app-for-xoso.vercel.app/api/xoso

## Endpoints

### 1. Lấy kết quả theo ngày
**Method:** GET
**Endpoint:** /api/xoso?date=YYYY-MM-DD

**Parameters:**
- date: Ngày cần lấy kết quả (hỗ trợ format YYYY-MM-DD hoặc DD-MM-YYYY)

**Ví dụ:**
GET /api/xoso?date=2025-08-02

**Response Schema:**
```json
{
  "ok": true,
  "range": false,
  "region": "xsmb",
  "date": "2025-08-02",
  "data": {
    "prizes": {
      "ĐB": ["78285"],
      "1": ["24867"],
      "2": ["31396", "07810"],
      "3": ["07403", "11044", "79055"],
      "4": ["14618", "34964", "90677"],
      "5": ["2262", "8504", "9999", "4641"],
      "6": ["0642", "7424", "4706"],
      "7": ["2079", "4123", "6154"]
    },
    "allNumbers": ["78285", "24867", "31396", "07810", ...],
    "meta": {
      "detectedDate": "02/08/2025",
      "tableSource": "table.table-result",
      "totalNumbers": 27
    }
  }
}
```

### 2. Lấy kết quả theo khoảng ngày
**Method:** GET
**Endpoint:** /api/xoso?start=YYYY-MM-DD&end=YYYY-MM-DD

**Parameters:**
- start: Ngày bắt đầu
- end: Ngày kết thúc
(Hỗ trợ format YYYY-MM-DD hoặc DD-MM-YYYY)

**Ví dụ:**
GET /api/xoso?start=2025-08-01&end=2025-08-03

**Response Schema:**
```json
{
  "ok": true,
  "range": true,
  "region": "xsmb",
  "start": "2025-08-01",
  "end": "2025-08-03",
  "results": [
    {
      "date": "2025-08-01",
      "data": {
        "prizes": { "ĐB": ["12345"], "1": ["67890"], ... },
        "allNumbers": [...],
        "meta": { ... }
      }
    },
    {
      "date": "2025-08-02", 
      "data": { ... }
    },
    {
      "date": "2025-08-03",
      "error": "No data found"
    }
  ]
}
```

## Cấu trúc dữ liệu

### Trường chính:
- ok: Trạng thái thành công
- range: Có phải khoảng ngày không
- region: Khu vực (luôn là "xsmb")
- date: Ngày (single date)
- start/end: Khoảng ngày

### Trường prizes:
- ĐB: Giải đặc biệt (1 số)
- 1: Giải nhất (1 số)
- 2: Giải nhì (2 số)
- 3-7: Giải ba đến bảy

## Ví dụ sử dụng

### JavaScript (fetch):
```javascript
// Lấy kết quả 1 ngày
const response = await fetch('/api/xoso?date=2025-08-02');
const data = await response.json();
console.log(data.data.prizes['ĐB']); // ["78285"]

// Lấy kết quả khoảng ngày
const rangeResponse = await fetch('/api/xoso?start=2025-08-01&end=2025-08-03');
const rangeData = await rangeResponse.json();
rangeData.results.forEach(result => {
  console.log(`${result.date}: ${result.data?.prizes['ĐB']}`);
});
```

### cURL:
```bash
# Lấy kết quả 1 ngày
curl "https://v0-next-js-app-for-xoso.vercel.app/api/xoso?date=2025-08-02"

# Lấy kết quả khoảng ngày  
curl "https://v0-next-js-app-for-xoso.vercel.app/api/xoso?start=2025-08-01&end=2025-08-03"
```

## Xử lý lỗi

### Lỗi 400 - Thiếu tham số:
```json
{
  "ok": false,
  "error": "Thiếu tham số. Dùng ?date=YYYY-MM-DD hoặc ?start=...&end=...",
  "exampleSingle": "/api/xoso?date=2025-08-02",
  "exampleRange": "/api/xoso?start=2025-08-01&end=2025-08-03"
}
```

### Lỗi 500 - Lỗi server:
```json
{
  "ok": false,
  "error": "Failed to scrape data"
}
```

---
API này cào dữ liệu từ xoso.com.vn và chỉ hỗ trợ xổ số miền Bắc (XSMB)

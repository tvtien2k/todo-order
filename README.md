# 🍜 Hệ thống Quản lý Món Ăn

Hệ thống web quản lý món ăn với giao diện tối giản, hiện đại và sử dụng localStorage để lưu trữ dữ liệu.

## ✨ Tính năng chính

- 🎯 **Giao diện tối giản** - Thiết kế hiện đại, dễ sử dụng
- 📝 **Modal thêm món** - Popup form gọn gàng
- 📋 **Danh sách món** hiển thị real-time
- 🔍 **Lọc món** theo trạng thái (Chưa làm/Đã làm/Đã trả tiền)
- 💰 **Tính tiền tự động** (Món chính: 15k, Topping: 5k mỗi cái)
- ✅ **Quản lý trạng thái** - Dropdown thay đổi trạng thái trực tiếp
- 📊 **Thống kê doanh thu** - Chưa thu / Đã thu
- 💾 **Lưu trữ local** với localStorage
- 📱 **Responsive design** cho mobile

## 🚀 Cài đặt và Sử dụng

### Bước 1: Chạy ứng dụng

1. Tải tất cả file về máy
2. Mở file `index.html` để sử dụng hệ thống chính
3. Ứng dụng sẽ hoạt động ngay với localStorage

### Bước 2: Sử dụng (Không cần cấu hình thêm)

Hệ thống sử dụng localStorage để lưu trữ dữ liệu, không cần cấu hình Google Sheets hay server nào khác.

## 📁 Cấu trúc file

```
order/
├── index.html              # Giao diện chính
├── styles.css              # CSS styling tối giản
├── config.js               # Cấu hình hệ thống
├── script.js               # JavaScript logic
└── README.md              # Hướng dẫn này
```

## 🎯 Cách sử dụng

### Thêm món mới

1. Click nút **"+ Thêm món"** để mở modal
2. Điền tên khách
3. Chọn món chính (mì nấu hoặc mì xào)
4. Chọn topping 1 và topping 2 (tùy chọn)
5. Xem giá tự động tính
6. Click **"Thêm món"**

### Quản lý món

- **Lọc món**: Sử dụng các nút lọc để xem món theo trạng thái
- **Swipe actions**: Vuốt trái/phải trên mobile để thay đổi trạng thái hoặc xóa món
- **Mặc định**: Danh sách hiển thị món "Chưa làm"

### Thống kê

- **Chưa thu**: Tổng tiền từ món chưa thanh toán
- **Đã thu**: Tổng tiền từ món đã thanh toán

## 💰 Bảng giá

| Loại | Giá (VNĐ) |
|------|-----------|
| Món chính (mì nấu/mì xào) | 15,000 |
| Topping (trứng/thịt/xúc xích) | 5,000 |

**Ví dụ**: Mì nấu + thịt + xúc xích = 15,000 + 5,000 + 5,000 = 25,000 VNĐ

## 🎨 Thiết kế

### Giao diện tối giản
- **Header đơn giản** với tiêu đề và nút thêm món
- **Thống kê gọn gàng** hiển thị 2 chỉ số chính
- **Bảng dữ liệu** tối ưu với 5 cột cần thiết
- **Modal popup** cho form thêm món
- **Màu sắc hiện đại** với palette xanh dương

### Responsive
- **Desktop**: Layout 2 cột cho thống kê
- **Tablet**: Layout 1 cột, modal full-width
- **Mobile**: Tối ưu cho màn hình nhỏ

## 🔧 Tính năng kỹ thuật

### Frontend
- **HTML5** semantic markup
- **CSS3** với Grid, Flexbox, modern design
- **Vanilla JavaScript** ES6+
- **LocalStorage** để lưu trữ local
- **Fetch API** để giao tiếp với Google Apps Script

### Backend (Local Storage)
- **LocalStorage API** để lưu trữ dữ liệu
- **Data persistence** giữa các phiên làm việc
- **No server required** - hoạt động offline
- **Fast performance** - không cần network

### Tính năng nâng cao
- **Modal popup** với backdrop blur
- **Keyboard shortcuts** (ESC để đóng modal)
- **Real-time updates** không cần refresh
- **Swipe actions** trên mobile
- **Auto-focus** vào input đầu tiên

## 🐛 Xử lý lỗi thường gặp

### Lỗi localStorage
- Kiểm tra trình duyệt có hỗ trợ localStorage không
- Đảm bảo không ở chế độ ẩn danh (incognito)
- Kiểm tra dung lượng localStorage có đủ không

### Dữ liệu không lưu
- Kiểm tra console browser để xem lỗi
- Đảm bảo tất cả trường bắt buộc đã điền
- Kiểm tra kết nối internet

## 🔄 Cập nhật và bảo trì

### Backup dữ liệu
- Dữ liệu được lưu tự động trong localStorage
- Có thể export dữ liệu bằng cách copy từ localStorage
- Backup tự động giữa các phiên làm việc

### Cập nhật giá
- Thay đổi giá trong file `script.js` phần `PRICES`
- Refresh trang để áp dụng thay đổi

### Thêm món mới
- Chỉnh sửa arrays trong `script.js` và `google-apps-script.js`
- Cập nhật validation logic

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console browser (F12)
2. LocalStorage trong Application tab
3. Đảm bảo trình duyệt hỗ trợ localStorage

## 📄 License

Dự án này được phát hành dưới MIT License. Bạn có thể tự do sử dụng, chỉnh sửa và phân phối.

---

**Lưu ý**: Đây là hệ thống demo, trong môi trường production nên thêm các biện pháp bảo mật như authentication, rate limiting, và data encryption. 
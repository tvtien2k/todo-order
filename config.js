// Cấu hình hệ thống quản lý món ăn

// Giá món ăn (VNĐ)
const PRICES = {
    mainDish: 20000, // Món chính (mì nấu/mì xào)
    topping: 5000    // Mỗi topping
};

// Danh sách món chính
const MAIN_DISHES = [
    { value: 'mì nấu', label: 'Mì nấu' },
    { value: 'mì xào', label: 'Mì xào' }
];

// Danh sách topping
const TOPPINGS = [
    { value: 'trứng', label: 'Trứng' },
    { value: 'thịt', label: 'Thịt' },
    { value: 'xúc xích', label: 'Xúc xích' }
];

// Trạng thái món ăn
const ORDER_STATUS = {
    PENDING: 'pending',
    COOKED: 'cooked',
    PAID: 'paid'
};

// Label cho trạng thái
const STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Chưa làm',
    [ORDER_STATUS.COOKED]: 'Đã làm',
    [ORDER_STATUS.PAID]: 'Đã trả tiền'
};

// Label cho actions
const ACTION_LABELS = {
    DELETE: 'Xóa',
    DELETE_CONFIRM: 'Bạn có chắc muốn xóa món này?',
    DELETE_SUCCESS: 'Đã xóa món',
    CANCEL_ACTION: 'Đã hủy thao tác',
    DELETE_ALL_CONFIRM: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác!',
    DELETE_ALL_SUCCESS: 'Đã xóa toàn bộ dữ liệu!'
};

// Label cho UI
const UI_LABELS = {
    EMPTY_STATE: 'Không có món nào',
    CUSTOMER_PREFIX: 'Khách'
};





// Cấu hình localStorage
const STORAGE_KEYS = {
    ORDERS: 'orders'
};

// Cấu hình thời gian
const TIME_CONFIG = {
    JUST_NOW: 1,        // Dưới 1 phút
    MINUTES: 60,        // Dưới 1 giờ
    HOURS: 1440         // Dưới 1 ngày
};

// Format thời gian
const TIME_FORMATS = {
    JUST_NOW: 'Vừa xong',
    MINUTES: 'phút trước',
    HOURS: 'giờ trước'
};

// Cấu hình notification
const NOTIFICATION_CONFIG = {
    DURATION: 3000     // 3 giây
};

// Cấu hình modal
const MODAL_CONFIG = {
    ESC_KEY: 'Escape'
};

// Cấu hình responsive
const BREAKPOINTS = {
    MOBILE: 480
};

// Cấu hình swipe
const SWIPE_CONFIG = {
    THRESHOLD: 50,           // Khoảng cách tối thiểu để tính là swipe
    TOUCH_DELAY: 100,        // Delay trước khi prevent default (ms)
    RESET_DURATION: 300,     // Thời gian reset animation (ms)
    DELETE_DURATION: 400,    // Thời gian animation xóa (ms)
    UPDATE_DURATION: 400     // Thời gian animation update (ms)
};

// Cấu hình quantity
const QUANTITY_CONFIG = {
    MIN: 1,                  // Số lượng tối thiểu
    MAX: 10                  // Số lượng tối đa
};

// Cấu hình animation
const ANIMATION_CONFIG = {
    STAGGER_DELAY: 50,       // Delay giữa các item animation (ms)
    FOCUS_DELAY: 100,        // Delay focus vào input (ms)
    RESIZE_DEBOUNCE: 250     // Debounce resize event (ms)
};

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        PRICES,
        MAIN_DISHES,
        TOPPINGS,
        ORDER_STATUS,
        STATUS_LABELS,
        ACTION_LABELS,
        UI_LABELS,
        STORAGE_KEYS,
        TIME_CONFIG,
        TIME_FORMATS,
        NOTIFICATION_CONFIG,
        MODAL_CONFIG,
        BREAKPOINTS,
        SWIPE_CONFIG,
        QUANTITY_CONFIG,
        ANIMATION_CONFIG
    };
} 
// Sử dụng cấu hình từ config.js

// Trạng thái lọc hiện tại - mặc định là "chưa làm"
let currentFilter = 'pending';

// Dữ liệu món ăn trong ngày
let orders = [];

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadOrders();
    // Gắn sự kiện cho nút xóa toàn bộ
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', handleDeleteAllData);
    }
});

// Khởi tạo ứng dụng
function initializeApp() {
    console.log('🚀 Khởi tạo hệ thống quản lý món ăn...');
    
    // Tải dữ liệu từ localStorage
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
        console.log(`📋 Đã tải ${orders.length} món từ localStorage`);
    }
    
    updateOrderTable();
    updateStats();
    updateFilterCounts();
}

// Thiết lập event listeners
function setupEventListeners() {
    // Form submit
    const orderForm = document.getElementById('orderForm');
    orderForm.addEventListener('submit', handleFormSubmit);
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    // Modal close khi click outside
    const modal = document.getElementById('addModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddModal();
        }
    });
    
    // ESC key để đóng modal
    document.addEventListener('keydown', function(e) {
        if (e.key === MODAL_CONFIG.ESC_KEY) {
            closeAddModal();
        }
    });
    
    // Resize window để cập nhật mô tả món (chỉ khi thực sự cần thiết)
    let lastWindowWidth = window.innerWidth;
    window.addEventListener('resize', function() {
        const currentWidth = window.innerWidth;
        // Chỉ cập nhật khi chuyển đổi giữa mobile và desktop
        const wasMobile = lastWindowWidth <= BREAKPOINTS.MOBILE;
        const isMobile = currentWidth <= BREAKPOINTS.MOBILE;
        
        if (wasMobile !== isMobile) {
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(() => {
                updateOrderTable();
            }, ANIMATION_CONFIG.RESIZE_DEBOUNCE);
        }
        lastWindowWidth = currentWidth;
    });
    
    // Initialize dish options
    initializeDishOptions();
}

// Mở modal thêm món
function openAddModal() {
    const modal = document.getElementById('addModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset form và title
    document.getElementById('modalTitle').textContent = 'Thêm món mới';
    document.getElementById('submitBtn').textContent = 'Thêm món';
    document.getElementById('editOrderId').value = '';
    document.getElementById('quantity').value = 1;
    
    // Cập nhật trạng thái nút quantity
    updateQuantityButtons(1);
    
    // Focus vào input đầu tiên
    setTimeout(() => {
        document.getElementById('customerName').focus();
    }, ANIMATION_CONFIG.FOCUS_DELAY);
}

// Đóng modal thêm món
function closeAddModal() {
    const modal = document.getElementById('addModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('orderForm').reset();
    
    // Reset dish options
    resetDishOptions();
}

// Xử lý submit form
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const editOrderId = formData.get('editOrderId');
    
    // Validation
    const mainDish = formData.get('mainDish');
    const quantity = parseInt(formData.get('quantity')) || 1;
    
    if (!mainDish) {
        showNotification('❌ Vui lòng chọn món chính!', 'error');
        return;
    }
    
    if (quantity < 1) {
        showNotification('❌ Số lượng phải lớn hơn 0!', 'error');
        return;
    }
    
    // Xử lý tên khách - nếu để trống thì lấy index
    let customerName = formData.get('customerName').trim();
    if (!customerName) {
        customerName = `${UI_LABELS.CUSTOMER_PREFIX} ${orders.length + 1}`;
    }
    
    // Cập nhật formData với tên khách mới
    formData.set('customerName', customerName);
    
    // Kiểm tra xem có phải đang edit không
    if (editOrderId) {
        await updateExistingOrder(editOrderId, formData);
    } else {
        await addNewOrder(formData);
    }
}

// Thêm món mới
async function addNewOrder(formData) {
    const quantity = parseInt(formData.get('quantity')) || 1;
    const baseOrderData = {
        customerName: formData.get('customerName'),
        mainDish: formData.get('mainDish'),
        topping1: formData.get('topping1'),
        topping2: formData.get('topping2'),
        totalPrice: calculateTotalPrice(formData),
        timestamp: new Date().toISOString(),
        status: ORDER_STATUS.PENDING
    };
    
    showLoading(true);
    
    try {
        // Tạo nhiều bản ghi theo số lượng
        for (let i = 0; i < quantity; i++) {
            const orderData = {
                ...baseOrderData,
                id: generateOrderId(),
                timestamp: new Date().toISOString()
            };
            orders.push(orderData);
        }
        
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        
        // Cập nhật giao diện
        updateOrderTable();
        updateStats();
        updateFilterCounts();
        
        // Đóng modal và hiển thị thông báo
        closeAddModal();
        const message = quantity > 1 ? `✅ Đã thêm ${quantity} món thành công!` : '✅ Đã thêm món thành công!';
        showNotification(message, 'success');
        
    } catch (error) {
        console.error('❌ Lỗi khi thêm món:', error);
        showNotification('❌ Có lỗi xảy ra khi thêm món!', 'error');
    } finally {
        showLoading(false);
    }
}

// Cập nhật món hiện có
async function updateExistingOrder(orderId, formData) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showNotification('❌ Không tìm thấy món để cập nhật!', 'error');
        return;
    }
    
    const updatedOrder = {
        ...orders[orderIndex],
        customerName: formData.get('customerName'),
        mainDish: formData.get('mainDish'),
        topping1: formData.get('topping1'),
        topping2: formData.get('topping2'),
        totalPrice: calculateTotalPrice(formData)
    };
    
    showLoading(true);
    
    try {
        orders[orderIndex] = updatedOrder;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        
        updateOrderTable();
        updateStats();
        updateFilterCounts();
        
        closeAddModal();
        showNotification('✅ Đã cập nhật món thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật món:', error);
        showNotification('❌ Có lỗi xảy ra khi cập nhật món!', 'error');
    } finally {
        showLoading(false);
    }
}

// Tính tổng giá
function calculateTotalPrice(formData) {
    let total = PRICES.mainDish;
    
    if (formData.get('topping1')) {
        total += PRICES.topping;
    }
    
    if (formData.get('topping2')) {
        total += PRICES.topping;
    }
    
    return total;
}

// Tạo ID duy nhất cho món
function generateOrderId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Xử lý click filter
function handleFilterClick(event) {
    const filter = event.target.dataset.filter;
    
    // Cập nhật trạng thái active
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentFilter = filter;
    updateOrderTable();
}

// Cập nhật danh sách món ăn
function updateOrderTable() {
    const ordersList = document.getElementById('ordersList');
    const filteredOrders = filterOrders(orders, currentFilter);
    
    // Kiểm tra xem có thay đổi thực sự không
    const currentContent = ordersList.innerHTML;
    const newContent = generateOrdersHTML(filteredOrders);
    
    if (currentContent !== newContent) {
        ordersList.innerHTML = newContent;
        
        // Chỉ thêm animation cho các item mới
        if (filteredOrders.length > 0) {
            const orderItems = ordersList.querySelectorAll('.order-item');
            orderItems.forEach((orderItem, index) => {
                orderItem.style.opacity = '0';
                orderItem.style.transform = 'translateY(20px)';
                
                // Thêm event listeners cho swipe
                addSwipeListeners(orderItem);
                
                setTimeout(() => {
                    orderItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    orderItem.style.opacity = '1';
                    orderItem.style.transform = 'translateY(0)';
                }, index * ANIMATION_CONFIG.STAGGER_DELAY);
            });
        }
    }
}

// Tạo HTML cho danh sách món ăn
function generateOrdersHTML(filteredOrders) {
    if (filteredOrders.length === 0) {
        return `<div class="empty-state">${UI_LABELS.EMPTY_STATE}</div>`;
    }
    
    return filteredOrders.map((order, index) => {
        const dishDescription = createDishDescription(order);
        const timeString = formatTime(order.timestamp);
        
        return `
            <div class="order-item" data-order-id="${order.id}">
                <div class="order-content">
                    <div class="order-info">
                        <div class="customer-name">${order.customerName}</div>
                        <div class="dish-info">${dishDescription}</div>
                    </div>
                    <div class="order-meta">
                        <div class="order-price">${order.totalPrice.toLocaleString('vi-VN')} VNĐ</div>
                        <div class="order-time">${timeString}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Thêm event listeners cho swipe
function addSwipeListeners(orderItem) {
    let isSwiping = false;
    
    orderItem.addEventListener('touchstart', (e) => {
        startSwipe(e, orderItem);
    });
    
    orderItem.addEventListener('touchmove', (e) => {
        updateSwipe(e, orderItem);
    }, { passive: false });
    
    orderItem.addEventListener('touchend', (e) => {
        endSwipe(e, orderItem);
    });
    
    orderItem.addEventListener('touchcancel', () => {
        if (isSwiping) {
            isSwiping = false;
            isCancelled = false;
            swipeDirection = null;
            orderItem.classList.remove('swiping', 'swipe-left', 'swipe-right');
            hideSwipeActionText(orderItem);
            resetItemPosition(orderItem);
        }
    });
}

// Format thời gian
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < TIME_CONFIG.JUST_NOW) {
        return TIME_FORMATS.JUST_NOW;
    } else if (diffMins < TIME_CONFIG.MINUTES) {
        return `${diffMins} ${TIME_FORMATS.MINUTES}`;
    } else if (diffMins < TIME_CONFIG.HOURS) {
        const hours = Math.floor(diffMins / 60);
        return `${hours} ${TIME_FORMATS.HOURS}`;
    } else {
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    }
}

// Tạo mô tả món gọn gàng
function createDishDescription(order) {
    const mainDish = MAIN_DISHES.find(dish => dish.value === order.mainDish);
    const mainDishLabel = mainDish ? mainDish.label : order.mainDish;
    
    const toppings = [];
    if (order.topping1) {
        const topping1 = TOPPINGS.find(t => t.value === order.topping1);
        toppings.push(topping1 ? topping1.label : order.topping1);
    }
    if (order.topping2) {
        const topping2 = TOPPINGS.find(t => t.value === order.topping2);
        toppings.push(topping2 ? topping2.label : order.topping2);
    }
    
    let description = mainDishLabel;
    
    if (toppings.length > 0) {
        const isMobile = window.innerWidth <= BREAKPOINTS.MOBILE;
        
        if (isMobile) {
            description = [mainDishLabel, ...toppings].join('<br>');
        } else {
            description += ` + ${toppings.join(', ')}`;
        }
    }
    
    return description;
}

// Lọc món theo trạng thái và sắp xếp theo thời gian
function filterOrders(orders, filter) {
    let filteredOrders;
    
    switch (filter) {
        case ORDER_STATUS.PENDING:
            filteredOrders = orders.filter(order => order.status === ORDER_STATUS.PENDING);
            break;
        case ORDER_STATUS.COOKED:
            filteredOrders = orders.filter(order => order.status === ORDER_STATUS.COOKED);
            break;
        case ORDER_STATUS.PAID:
            filteredOrders = orders.filter(order => order.status === ORDER_STATUS.PAID);
            break;
        default:
            filteredOrders = orders;
    }
    
    return filteredOrders.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Cập nhật trạng thái món
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        
        updateStats();
        updateFilterCounts();
        
        setTimeout(() => {
            updateOrderTable();
        }, ANIMATION_CONFIG.FOCUS_DELAY);
        
        const select = event.target;
        select.className = `status-select status-${newStatus}`;
        
        const statusText = STATUS_LABELS[newStatus].toLowerCase();
        showNotification(`✅ ${order.customerName} - ${statusText}!`, 'success');
    }
}

// Chỉnh sửa món
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    document.getElementById('modalTitle').textContent = 'Chỉnh sửa món';
    document.getElementById('submitBtn').textContent = 'Cập nhật món';
    document.getElementById('editOrderId').value = orderId;
    
    document.getElementById('customerName').value = order.customerName;
    document.getElementById('quantity').value = 1;
    
    selectDishOptionByValue('mainDishOptions', order.mainDish, 'mainDish');
    
    if (order.topping1) {
        selectDishOptionByValue('topping1Options', order.topping1, 'topping1');
    }
    if (order.topping2) {
        selectDishOptionByValue('topping2Options', order.topping2, 'topping2');
    }
    
    updateQuantityButtons(1);
    
    const modal = document.getElementById('addModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.getElementById('customerName').focus();
    }, 100);
}

// Xóa món
function deleteOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    setTimeout(() => {
        updateOrderTable();
        updateStats();
        updateFilterCounts();
    }, ANIMATION_CONFIG.FOCUS_DELAY);
    
    showNotification(`🗑️ Đã xóa món của ${order.customerName}!`, 'success');
}

// Thêm hàm xử lý xóa toàn bộ data
function handleDeleteAllData() {
    if (confirm(ACTION_LABELS.DELETE_ALL_CONFIRM)) {
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        orders = [];
        updateOrderTable();
        updateStats();
        updateFilterCounts();
        showNotification(ACTION_LABELS.DELETE_ALL_SUCCESS, 'success');
    }
}

// Cập nhật thống kê
function updateStats() {
    const pendingRevenue = orders
        .filter(o => o.status !== ORDER_STATUS.PAID)
        .reduce((sum, o) => sum + o.totalPrice, 0);
    
    const collectedRevenue = orders
        .filter(o => o.status === ORDER_STATUS.PAID)
        .reduce((sum, o) => sum + o.totalPrice, 0);
    
    document.getElementById('pendingRevenue').textContent = pendingRevenue.toLocaleString('vi-VN') + ' VNĐ';
    document.getElementById('collectedRevenue').textContent = collectedRevenue.toLocaleString('vi-VN') + ' VNĐ';
}

// Cập nhật số lượng món trên nút lọc
function updateFilterCounts() {
    const pendingCount = orders.filter(o => o.status === ORDER_STATUS.PENDING).length;
    const cookedCount = orders.filter(o => o.status === ORDER_STATUS.COOKED).length;
    const paidCount = orders.filter(o => o.status === ORDER_STATUS.PAID).length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('cookedCount').textContent = cookedCount;
    document.getElementById('paidCount').textContent = paidCount;
    
    document.getElementById('pendingCount').style.display = pendingCount > 0 ? 'block' : 'none';
    document.getElementById('cookedCount').style.display = cookedCount > 0 ? 'block' : 'none';
    document.getElementById('paidCount').style.display = paidCount > 0 ? 'block' : 'none';
}

// Tải dữ liệu từ localStorage
function loadOrders() {
    // Chỉ sử dụng localStorage
}

// Hiển thị loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, NOTIFICATION_CONFIG.DURATION);
}

// Khởi tạo dish options
function initializeDishOptions() {
    createDishOptions('mainDishOptions', MAIN_DISHES, 'mainDish');
    createDishOptions('topping1Options', TOPPINGS, 'topping1');
    createDishOptions('topping2Options', TOPPINGS, 'topping2');
}

// Tạo dish options
function createDishOptions(containerId, options, fieldName) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'dish-option';
        optionElement.textContent = option.label;
        optionElement.dataset.value = option.value;
        optionElement.dataset.field = fieldName;
        
        optionElement.addEventListener('click', () => {
            selectDishOption(containerId, optionElement, fieldName);
        });
        
        container.appendChild(optionElement);
    });
}

// Chọn dish option
function selectDishOption(containerId, selectedElement, fieldName) {
    const container = document.getElementById(containerId);
    
    const isAlreadySelected = selectedElement.classList.contains('selected');
    
    container.querySelectorAll('.dish-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (!isAlreadySelected) {
        selectedElement.classList.add('selected');
    }
    
    let hiddenInput = document.querySelector(`input[name="${fieldName}"]`);
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = fieldName;
        document.getElementById('orderForm').appendChild(hiddenInput);
    }
    
    hiddenInput.value = isAlreadySelected ? '' : selectedElement.dataset.value;
}

// Reset dish options
function resetDishOptions() {
    document.querySelectorAll('.dish-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelectorAll('input[name="mainDish"], input[name="topping1"], input[name="topping2"]').forEach(input => {
        input.remove();
    });
}

// Chọn dish option theo giá trị
function selectDishOptionByValue(containerId, value, fieldName) {
    const container = document.getElementById(containerId);
    const option = container.querySelector(`[data-value="${value}"]`);
    
    if (option) {
        selectDishOption(containerId, option, fieldName);
    }
}

// Thay đổi số lượng
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    let currentQuantity = parseInt(quantityInput.value) || 1;
    let newQuantity = currentQuantity + delta;
    
    newQuantity = Math.max(QUANTITY_CONFIG.MIN, Math.min(QUANTITY_CONFIG.MAX, newQuantity));
    
    quantityInput.value = newQuantity;
    updateQuantityButtons(newQuantity);
}

// Cập nhật trạng thái nút quantity
function updateQuantityButtons(quantity) {
    const minusBtn = document.querySelector('.quantity-btn:first-child');
    const plusBtn = document.querySelector('.quantity-btn:last-child');
    
    minusBtn.disabled = quantity <= QUANTITY_CONFIG.MIN;
    plusBtn.disabled = quantity >= QUANTITY_CONFIG.MAX;
}

// Swipe actions
let isSwiping = false;
let isCancelled = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let swipeThreshold = SWIPE_CONFIG.THRESHOLD;
let swipeDirection = null;

function startSwipe(e, orderItem) {
    isSwiping = true;
    isCancelled = false;
    swipeDirection = null;
    
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    
    currentX = startX;
    currentY = startY;
    
    orderItem.classList.add('swiping');
    orderItem.dataset.touchStartTime = Date.now();
}

function updateSwipe(e, orderItem) {
    if (!isSwiping) return;
    
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
    
    const deltaX = currentX - startX;
    const deltaY = Math.abs(currentY - startY);
    
    const touchStartTime = parseInt(orderItem.dataset.touchStartTime || '0');
    const touchDuration = Date.now() - touchStartTime;
    
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > deltaY) {
        if (touchDuration > SWIPE_CONFIG.TOUCH_DELAY) {
            e.preventDefault();
        }
        
        const newDirection = deltaX > 0 ? 'right' : 'left';
        
        if (swipeDirection !== newDirection) {
            if (swipeDirection) {
                orderItem.classList.remove('swipe-left', 'swipe-right');
                hideSwipeActionText(orderItem);
                resetItemPosition(orderItem);
                swipeDirection = null;
                isCancelled = true;
                return;
            }
            
            orderItem.classList.remove('swipe-left', 'swipe-right');
            swipeDirection = newDirection;
            orderItem.classList.add('swipe-' + swipeDirection);
        } else if (!swipeDirection) {
            swipeDirection = newDirection;
            orderItem.classList.add('swipe-' + swipeDirection);
        }
        
        showSwipeActionText(orderItem, swipeDirection);
    } else {
        if (swipeDirection) {
            orderItem.classList.remove('swipe-left', 'swipe-right');
            hideSwipeActionText(orderItem);
            resetItemPosition(orderItem);
            swipeDirection = null;
        }
    }
}

function endSwipe(e, orderItem) {
    if (!isSwiping) return;
    
    const endX = e.changedTouches[0].clientX;
    
    const deltaX = endX - startX;
    const deltaY = Math.abs(currentY - startY);
    
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > deltaY && !isCancelled) {
        const finalDirection = deltaX > 0 ? 'right' : 'left';
        handleSwipeAction(orderItem, finalDirection);
    } else if (isCancelled) {
        showNotification(ACTION_LABELS.CANCEL_ACTION, 'info');
    }
    
    isSwiping = false;
    isCancelled = false;
    swipeDirection = null;
    
    orderItem.classList.remove('swiping', 'swipe-left', 'swipe-right');
    hideSwipeActionText(orderItem);
}

// Hiển thị action text khi swipe
function showSwipeActionText(orderItem, direction) {
    const orderId = orderItem.dataset.orderId;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const currentStatus = order.status;
    let actionText = '';
    let actionClass = '';
    
    if (currentStatus === ORDER_STATUS.PENDING) {
        if (direction === 'left') {
            actionText = ACTION_LABELS.DELETE;
            actionClass = 'action-delete';
        } else if (direction === 'right') {
            actionText = STATUS_LABELS[ORDER_STATUS.COOKED];
            actionClass = 'action-cooked';
        }
    } else if (currentStatus === ORDER_STATUS.COOKED) {
        if (direction === 'left') {
            actionText = STATUS_LABELS[ORDER_STATUS.PENDING];
            actionClass = 'action-pending';
        } else if (direction === 'right') {
            actionText = STATUS_LABELS[ORDER_STATUS.PAID];
            actionClass = 'action-paid';
        }
    } else if (currentStatus === ORDER_STATUS.PAID) {
        if (direction === 'left') {
            actionText = STATUS_LABELS[ORDER_STATUS.COOKED];
            actionClass = 'action-cooked';
        }
    }
    
    let actionTextElement = orderItem.querySelector('.swipe-action-text');
    if (!actionTextElement) {
        actionTextElement = document.createElement('div');
        actionTextElement.className = 'swipe-action-text';
        orderItem.appendChild(actionTextElement);
    }
    
    actionTextElement.textContent = actionText;
    actionTextElement.className = `swipe-action-text ${actionClass}`;
    actionTextElement.style.display = 'block';
}

// Ẩn action text
function hideSwipeActionText(orderItem) {
    const actionTextElement = orderItem.querySelector('.swipe-action-text');
    if (actionTextElement) {
        actionTextElement.style.display = 'none';
    }
}

// Reset item về vị trí ban đầu với animation
function resetItemPosition(orderItem) {
    orderItem.classList.add('swipe-reset');
    
    setTimeout(() => {
        orderItem.classList.remove('swipe-reset');
    }, SWIPE_CONFIG.RESET_DURATION);
}

// Animation xóa món với hiệu ứng dồn lên
function animateAndDeleteOrder(orderItem, orderId) {
    orderItem.classList.add('item-deleting');
    
    setTimeout(() => {
        deleteOrder(orderId);
        showNotification(ACTION_LABELS.DELETE_SUCCESS, 'success');
    }, SWIPE_CONFIG.DELETE_DURATION);
}

// Animation update món với hiệu ứng dồn lên
function animateAndUpdateOrder(orderItem, orderId, newStatus) {
    orderItem.classList.add('item-updating');
    
    setTimeout(() => {
        updateOrderStatus(orderId, newStatus);
        showNotification(`Đã cập nhật trạng thái thành ${STATUS_LABELS[newStatus].toLowerCase()}`, 'success');
    }, SWIPE_CONFIG.UPDATE_DURATION);
}

// Xử lý hành động swipe dựa trên trạng thái
function handleSwipeAction(orderItem, direction) {
    const orderId = orderItem.dataset.orderId;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const currentStatus = order.status;
    let action = null;
    let newStatus = null;
    
    if (currentStatus === ORDER_STATUS.PENDING) {
        if (direction === 'left') {
            action = 'delete';
        } else if (direction === 'right') {
            action = 'update';
            newStatus = ORDER_STATUS.COOKED;
        }
    } else if (currentStatus === ORDER_STATUS.COOKED) {
        if (direction === 'left') {
            action = 'update';
            newStatus = ORDER_STATUS.PENDING;
        } else if (direction === 'right') {
            action = 'update';
            newStatus = ORDER_STATUS.PAID;
        }
    } else if (currentStatus === ORDER_STATUS.PAID) {
        if (direction === 'left') {
            action = 'update';
            newStatus = ORDER_STATUS.COOKED;
        }
    }
    
    if (action === 'delete') {
        if (confirm(ACTION_LABELS.DELETE_CONFIRM)) {
            animateAndDeleteOrder(orderItem, orderId);
        }
    } else if (action === 'update' && newStatus) {
        animateAndUpdateOrder(orderItem, orderId, newStatus);
    }
}

// Thêm các hàm vào global scope
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.updateOrderStatus = updateOrderStatus;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.changeQuantity = changeQuantity; 
// ==================== ЕДИНАЯ БАЗА ДАННЫХ ====================

const DB = {
    // Ключи для localStorage - ИСПРАВЛЕНЫ для совместимости с login.html
    KEYS: {
        USERS: 'vanillaHouseUsers',           // было: 'vanillaHouse_users'
        CURRENT_USER: 'vanillaHouseCurrentUser', // было: 'vanillaHouse_currentUser'
        ORDERS: 'vanillaHouseOrders',         // было: 'vanillaHouse_orders'
        PRODUCTS: 'vanillaHouseProducts',     // было: 'vanillaHouse_products'
        RESERVATIONS: 'vanillaHouseReservations', // было: 'vanillaHouse_reservations'
        BONUSES: 'vanillaHouse_bonuses',
        ADDRESSES: 'vanillaHouse_addresses',
        PROMOTIONS: 'vanillaHouse_promotions',
        SETTINGS: 'vanillaHouse_settings',
        CART: 'vanillaHouse_cart'
    },

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    init() {
        this.initUsers();
        this.initProducts();
        this.initPromotions();
        // Не перезаписываем существующие данные пользователя
    },

    initUsers() {
        let users = this.getUsers();
        if (users.length === 0) {
            users = [
                {
                    id: 1,
                    name: 'Администратор',
                    email: 'admin@vanilniydom.ru',
                    phone: '+7 (495) 123-45-67',
                    password: 'admin123',
                    role: 'admin',
                    bonuses: 0,
                    ordersCount: 0,
                    registrationDate: '2024-01-01',
                    birthDate: '1990-01-01',
                    avatar: null
                },
                {
                    id: 2,
                    name: 'Анна Петрова',
                    email: 'anna@test.ru',
                    phone: '+7 (999) 111-22-33',
                    password: '123456',
                    role: 'user',
                    bonuses: 250,
                    ordersCount: 3,
                    registrationDate: '2024-01-15',
                    birthDate: '1990-05-15',
                    avatar: null
                },
                {
                    id: 3,
                    name: 'Иван Иванов',
                    email: 'ivan@test.ru',
                    phone: '+7 (999) 222-33-44',
                    password: '123456',
                    role: 'user',
                    bonuses: 120,
                    ordersCount: 2,
                    registrationDate: '2024-02-01',
                    birthDate: '1988-10-20',
                    avatar: null
                }
            ];
            this.saveUsers(users);
        }
    },

    initProducts() {
        let products = this.getProducts();
        if (products.length === 0) {
            products = [
                { id: 1, name: 'Шоколадный рай', category: 'cake', price: 450, description: 'Нежнейший шоколадный торт', stock: 15, status: 'active', sold: 42, image: '' },
                { id: 2, name: 'Клубничный чизкейк', category: 'pastry', price: 380, description: 'Классический чизкейк', stock: 8, status: 'active', sold: 38, image: '' },
                { id: 3, name: 'Макаруны ассорти', category: 'cookie', price: 320, description: 'Набор из 6 макарунов', stock: 20, status: 'active', sold: 28, image: '' },
                { id: 4, name: 'Латте с карамелью', category: 'coffee', price: 280, description: 'Нежный латте', stock: 50, status: 'active', sold: 35, image: '' },
                { id: 5, name: 'Красный бархат', category: 'cake', price: 520, description: 'Яркий торт', stock: 5, status: 'active', sold: 25, image: '' }
            ];
            this.saveProducts(products);
        }
    },

    initPromotions() {
        let promotions = this.getPromotions();
        if (promotions.length === 0) {
            promotions = [
                { id: 1, title: 'Скидка 20% на первый заказ', description: 'Для новых клиентов', discount: 20, code: 'WELCOME20', validUntil: '2026-02-28', status: 'active' },
                { id: 2, title: 'Бесплатная доставка', description: 'При заказе от 1500 ₽', discount: 0, code: 'FREEDELIVERY', validUntil: '2026-03-31', status: 'active' },
                { id: 3, title: 'Кофе в подарок', description: 'За каждый 5-й заказ', discount: 0, code: null, validUntil: '2026-12-31', status: 'active' }
            ];
            this.savePromotions(promotions);
        }
    },

    // ==================== ПОЛЬЗОВАТЕЛИ ====================
    getUsers() {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : [];
    },

    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    getUserById(id) {
        return this.getUsers().find(u => u.id === id);
    },

    getUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    },

    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            role: 'user',
            bonuses: 100,
            ordersCount: 0,
            registrationDate: new Date().toISOString().split('T')[0],
            birthDate: userData.birthDate || '',
            avatar: null
        };
        users.push(newUser);
        this.saveUsers(users);

        // Добавляем бонусы за регистрацию
        this.addBonusHistory({
            userId: newUser.id,
            amount: 100,
            description: 'Бонусы за регистрацию',
            type: 'earned'
        });

        return newUser;
    },

    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);

            // Обновляем текущего пользователя если это он
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === id) {
                this.setCurrentUser(users[index]);
            }
            return users[index];
        }
        return null;
    },

    deleteUser(id) {
        let users = this.getUsers();
        const user = users.find(u => u.id === id);
        if (user && user.role === 'admin') return false;
        users = users.filter(u => u.id !== id);
        this.saveUsers(users);
        return true;
    },

    // ==================== АВТОРИЗАЦИЯ ====================
    getCurrentUser() {
        const data = localStorage.getItem(this.KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    },

    setCurrentUser(user) {
        if (user) {
            const { password, ...safeUser } = user;
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));
        } else {
            localStorage.removeItem(this.KEYS.CURRENT_USER);
        }
    },

    login(email, password) {
        const user = this.getUserByEmail(email);
        if (user && user.password === password) {
            this.setCurrentUser(user);
            return user;
        }
        return null;
    },

    logout() {
        this.setCurrentUser(null);
        localStorage.removeItem(this.KEYS.CART);
    },

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    checkAuthRedirect() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        // Если админ пытается зайти в ЛК - перенаправляем в админку
        if (user.role === 'admin' && window.location.pathname.includes('profile')) {
            window.location.href = 'admin.html';
            return false;
        }
        return true;
    },

    // ==================== ЗАКАЗЫ ====================
    getOrders() {
        const data = localStorage.getItem(this.KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
    },

    saveOrders(orders) {
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    },

    getUserOrders(userId) {
        return this.getOrders().filter(o => o.userId === userId);
    },

    createOrder(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            id: Date.now(),
            userId: orderData.userId,
            customerName: orderData.customerName,
            email: orderData.email,
            phone: orderData.phone,
            items: orderData.items,
            total: orderData.total,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            address: orderData.address,
            payment: orderData.payment,
            delivery: orderData.delivery,
            usedBonuses: orderData.usedBonuses || 0
        };
        orders.push(newOrder);
        this.saveOrders(orders);

        // Обновляем количество заказов у пользователя
        const user = this.getUserById(orderData.userId);
        if (user) {
            this.updateUser(user.id, { ordersCount: (user.ordersCount || 0) + 1 });
        }

        // Начисляем бонусы (5% от суммы заказа)
        const bonusAmount = Math.floor(orderData.total * 0.05);
        if (bonusAmount > 0) {
            this.updateUser(orderData.userId, { bonuses: (user.bonuses || 0) + bonusAmount });
            this.addBonusHistory({
                userId: orderData.userId,
                amount: bonusAmount,
                description: `Бонусы за заказ #${newOrder.id}`,
                type: 'earned'
            });
        }

        return newOrder;
    },

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            this.saveOrders(orders);
            return orders[index];
        }
        return null;
    },

    // ==================== ТОВАРЫ ====================
    getProducts() {
        const data = localStorage.getItem(this.KEYS.PRODUCTS);
        return data ? JSON.parse(data) : [];
    },

    saveProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },

    getProductById(id) {
        return this.getProducts().find(p => p.id === id);
    },

    addProduct(productData) {
        const products = this.getProducts();
        const newProduct = {
            id: Date.now(),
            name: productData.name,
            category: productData.category,
            price: productData.price,
            description: productData.description,
            stock: productData.stock || 0,
            status: productData.status || 'active',
            sold: 0,
            image: productData.image || ''
        };
        products.push(newProduct);
        this.saveProducts(products);
        return newProduct;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            this.saveProducts(products);
            return products[index];
        }
        return null;
    },

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveProducts(products);
        return true;
    },

    // ==================== БРОНИРОВАНИЯ ====================
    getReservations() {
        const data = localStorage.getItem(this.KEYS.RESERVATIONS);
        return data ? JSON.parse(data) : [];
    },

    saveReservations(reservations) {
        localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify(reservations));
    },

    createReservation(reservationData) {
        const reservations = this.getReservations();
        const newReservation = {
            id: Date.now(),
            userId: reservationData.userId,
            name: reservationData.name,
            phone: reservationData.phone,
            email: reservationData.email,
            date: reservationData.date,
            time: reservationData.time,
            guests: reservationData.guests,
            status: 'pending',
            message: reservationData.message || '',
            createdAt: new Date().toISOString()
        };
        reservations.push(newReservation);
        this.saveReservations(reservations);
        return newReservation;
    },

    updateReservationStatus(id, status) {
        const reservations = this.getReservations();
        const index = reservations.findIndex(r => r.id === id);
        if (index !== -1) {
            reservations[index].status = status;
            this.saveReservations(reservations);
            return reservations[index];
        }
        return null;
    },

    // ==================== АДРЕСА ====================
    getAddresses() {
        const data = localStorage.getItem(this.KEYS.ADDRESSES);
        return data ? JSON.parse(data) : [];
    },

    saveAddresses(addresses) {
        localStorage.setItem(this.KEYS.ADDRESSES, JSON.stringify(addresses));
    },

    getUserAddresses(userId) {
        return this.getAddresses().filter(a => a.userId === userId);
    },

    addAddress(addressData) {
        const addresses = this.getAddresses();
        const newAddress = {
            id: Date.now(),
            userId: addressData.userId,
            name: addressData.name,
            city: addressData.city,
            street: addressData.street,
            house: addressData.house,
            apartment: addressData.apartment || '',
            entrance: addressData.entrance || '',
            floor: addressData.floor || '',
            intercom: addressData.intercom || '',
            isDefault: addressData.isDefault || false
        };

        if (newAddress.isDefault) {
            addresses.forEach(a => {
                if (a.userId === addressData.userId) a.isDefault = false;
            });
        }

        addresses.push(newAddress);
        this.saveAddresses(addresses);
        return newAddress;
    },

    // ==================== БОНУСЫ ====================
    getBonusHistory() {
        const data = localStorage.getItem(this.KEYS.BONUSES);
        return data ? JSON.parse(data) : [];
    },

    saveBonusHistory(history) {
        localStorage.setItem(this.KEYS.BONUSES, JSON.stringify(history));
    },

    getUserBonuses(userId) {
        const user = this.getUserById(userId);
        return user ? user.bonuses : 0;
    },

    addBonusHistory(entry) {
        const history = this.getBonusHistory();
        history.push({
            id: Date.now(),
            userId: entry.userId,
            amount: entry.amount,
            description: entry.description,
            type: entry.type,
            date: new Date().toISOString()
        });
        this.saveBonusHistory(history);
    },

    getUserBonusHistory(userId) {
        return this.getBonusHistory()
            .filter(h => h.userId === userId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // ==================== АКЦИИ ====================
    getPromotions() {
        const data = localStorage.getItem(this.KEYS.PROMOTIONS);
        return data ? JSON.parse(data) : [];
    },

    savePromotions(promotions) {
        localStorage.setItem(this.KEYS.PROMOTIONS, JSON.stringify(promotions));
    },

    getActivePromotions() {
        const today = new Date().toISOString().split('T')[0];
        return this.getPromotions().filter(p => p.status === 'active' && p.validUntil >= today);
    },

    // ==================== СТАТИСТИКА ====================
    getStats() {
        const users = this.getUsers();
        const orders = this.getOrders();
        const products = this.getProducts();
        const reservations = this.getReservations();

        const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = orders.filter(o => o.date === today && o.status === 'completed').reduce((sum, o) => sum + o.total, 0);

        return {
            totalUsers: users.length,
            totalOrders: orders.length,
            totalProducts: products.length,
            totalReservations: reservations.length,
            totalRevenue: totalRevenue,
            todayRevenue: todayRevenue,
            avgOrder: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0
        };
    }
};

// Запускаем инициализацию
DB.init();
function getNews() {
    return JSON.parse(localStorage.getItem('vanillaHouseNews') || '[]');
}

function saveNews(news) {
    localStorage.setItem('vanillaHouseNews', JSON.stringify(news));
}

function addNews(event) {
    event.preventDefault();
    const news = getNews();
    const newNewsItem = {
        id: Date.now(),
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    news.unshift(newNewsItem);
    saveNews(news);
    showNotification(`Новость "${newNewsItem.title}" опубликована!`, 'success');
    closeModal('addNews');
    loadNews();
}

function deleteNews(id) {
    if (!confirm('Удалить эту новость?')) return;
    let news = getNews();
    news = news.filter(n => n.id !== id);
    saveNews(news);
    showNotification('Новость удалена', 'success');
    loadNews();
    // Также обновляем счетчик
    document.getElementById('newsCount').textContent = news.length;
}

function loadNews() {
    const news = getNews();
    const newsCountSpan = document.getElementById('newsCount');
    if (newsCountSpan) newsCountSpan.textContent = news.length;

    const tbody = document.getElementById('newsTable');
    if (tbody) {
        tbody.innerHTML = news.map(item => `
                <tr>
                    <td>#${item.id}</td>
                    <td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.content.substring(0, 100))}${item.content.length > 100 ? '...' : ''}</small></td>
                    <td>${item.date}</td>
                    <td><button class="btn btn-sm btn-icon btn-danger" onclick="deleteNews(${item.id})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `).join('');
    }
}

// Простая функция для экранирования HTML
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ОБНОВЛЯЕМ ФУНКЦИЮ getSectionName (добавляем 'news')
function getSectionName(sectionId) {
    const names = {
        'dashboard': 'Дашборд',
        'orders': 'Заказы',
        'products': 'Товары',
        'users': 'Пользователи',
        'reservations': 'Бронирования',
        'news': 'Новости сайта'  // 👈 ДОБАВЬТЕ ЭТУ СТРОКУ
    };
    return names[sectionId] || sectionId;
}

// ОБНОВЛЯЕМ ФУНКЦИЮ showSection (добавляем вызов loadNews)
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId + 'Section').style.display = 'block';
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => {
        if (link.textContent.includes(getSectionName(sectionId))) {
            link.parentElement.classList.add('active');
        }
    });
    if (sectionId === 'orders') loadAllOrders();
    if (sectionId === 'products') loadProducts();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'reservations') loadReservations();
    if (sectionId === 'news') loadNews();  // 👈 ДОБАВЬТЕ ЭТУ СТРОКУ
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAdminAccess()) return;
    loadCurrentUser();
    refreshAllData();

    // Загружаем новости (для счетчика)
    loadNews();

    document.getElementById('logoutBtn').addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Выйти из админ панели?')) {
            DB.logout();
            window.location.href = 'index.html';
        }
    });
});
</script >

    // Для отладки - выводим в консоль
    console.log('Database.js loaded');
console.log('Current user:', DB.getCurrentUser());
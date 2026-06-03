// auth.js - Централизованная система авторизации

const AuthService = {
    // Ключи для localStorage
    USERS_KEY: 'vanillaHouseUsers',
    CURRENT_USER_KEY: 'vanillaHouseCurrentUser',
    
    // Проверка email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Проверка пароля
    isValidPassword(password) {
        return password.length >= 6;
    },
    
    // Регистрация пользователя
    register(userData) {
        try {
            let users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
            
            // Проверка уникальности email
            if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                return { success: false, message: 'Пользователь с таким email уже существует' };
            }
            
            // Генерируем ID
            userData.id = Date.now();
            userData.registrationDate = new Date().toISOString();
            userData.bonuses = 200; // Бонусы за регистрацию
            userData.orders = [];
            userData.addresses = [];
            userData.role = 'user';
            
            // Добавляем пользователя
            users.push(userData);
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
            
            // Автоматический вход после регистрации
            const { password, ...userWithoutPassword } = userData;
            this.setCurrentUser(userWithoutPassword);
            
            // Инициализация данных пользователя
            this.initializeUserData(userData.id);
            
            return { success: true, user: userWithoutPassword };
        } catch (error) {
            return { success: false, message: 'Ошибка при регистрации' };
        }
    },
    
    // Вход пользователя
    login(email, password, rememberMe = true) {
        try {
            const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );
            
            if (user) {
                const { password, ...userWithoutPassword } = user;
                
                if (rememberMe) {
                    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
                } else {
                    sessionStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
                }
                
                return { success: true, user: userWithoutPassword };
            }
            
            return { success: false, message: 'Неверный email или пароль' };
        } catch (error) {
            return { success: false, message: 'Ошибка при входе' };
        }
    },
    
    // Выход пользователя
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        sessionStorage.removeItem(this.CURRENT_USER_KEY);
    },
    
    // Получение текущего пользователя
    getCurrentUser() {
        const userFromLocal = localStorage.getItem(this.CURRENT_USER_KEY);
        const userFromSession = sessionStorage.getItem(this.CURRENT_USER_KEY);
        
        if (userFromLocal) {
            return JSON.parse(userFromLocal);
        }
        
        if (userFromSession) {
            return JSON.parse(userFromSession);
        }
        
        return null;
    },
    
    // Проверка авторизации
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    // Установка текущего пользователя
    setCurrentUser(user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    },
    
    // Инициализация данных пользователя
    initializeUserData(userId) {
        // История бонусов
        let bonusesHistory = JSON.parse(localStorage.getItem('vanillaHouseBonusesHistory') || '[]');
        bonusesHistory.push({
            userId: userId,
            type: 'registration',
            amount: 200,
            description: 'Бонусы за регистрацию',
            date: new Date().toISOString()
        });
        localStorage.setItem('vanillaHouseBonusesHistory', JSON.stringify(bonusesHistory));
        
        // Корзина
        let carts = JSON.parse(localStorage.getItem('vanillaHouseCarts') || '{}');
        carts[userId] = [];
        localStorage.setItem('vanillaHouseCarts', JSON.stringify(carts));
        
        // Избранное
        let favorites = JSON.parse(localStorage.getItem('vanillaHouseFavorites') || '{}');
        favorites[userId] = [];
        localStorage.setItem('vanillaHouseFavorites', JSON.stringify(favorites));
    },
    
    // Обновление навигации
    updateNavigation() {
        const authNavItem = document.getElementById('authNavItem');
        
        if (!authNavItem) return;
        
        if (this.isAuthenticated()) {
            const user = this.getCurrentUser();
            const firstName = user.name.split(' ')[0];
            
            authNavItem.innerHTML = `
                <li class="nav-user">
                    <a href="profile-index.html" class="user-link">
                        <div class="user-avatar-small">${user.name.charAt(0)}</div>
                        <span>${firstName}</span>
                        <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="user-dropdown">
                        <a href="profile-index.html"><i class="fas fa-user"></i> Личный кабинет</a>
                        <a href="profile-orders.html"><i class="fas fa-shopping-bag"></i> Мои заказы</a>
                        <a href="profile-bonuses.html"><i class="fas fa-gift"></i> Бонусы</a>
                        <div class="divider"></div>
                        <a href="#" id="logoutLink"><i class="fas fa-sign-out-alt"></i> Выйти</a>
                    </div>
                </li>
            `;
            
            document.getElementById('logoutLink')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                window.location.reload();
            });
        } else {
            authNavItem.innerHTML = `
                <li class="nav-auth">
                    <div class="auth-buttons">
                        <a href="login.html" class="auth-btn">Войти</a>
                        <a href="register.html" class="auth-btn primary">Регистрация</a>
                    </div>
                </li>
            `;
        }
    }
};
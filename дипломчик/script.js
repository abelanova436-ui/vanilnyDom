// Переменные для авторизации
const authButtons = document.getElementById('authButtons');
const userAvatar = document.getElementById('userAvatar');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Проверяем статус авторизации при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Функция проверки статуса авторизации
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        // Пользователь авторизован
        authButtons.style.display = 'none';
        userAvatar.style.display = 'flex';
        userAvatar.textContent = user.name.charAt(0).toUpperCase();
        
        // Добавляем обработчик клика на аватар
        userAvatar.onclick = () => {
            window.location.href = 'personal-cabinet.html';
        };
    } else {
        // Пользователь не авторизован
        authButtons.style.display = 'flex';
        userAvatar.style.display = 'none';
    }
}

// Обработчики для кнопок авторизации
loginBtn.addEventListener('click', () => {
    window.location.href = 'personal-cabinet.html';
});

registerBtn.addEventListener('click', () => {
    window.location.href = 'personal-cabinet.html';
});
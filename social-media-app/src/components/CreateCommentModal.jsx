import React, { useState, useEffect, useCallback } from 'react';
import './Modal.css'; // Используем стили для модального окна

// --- Вспомогательная функция для получения CSRF токена из куки ---
// (Нужно, если Django использует CSRF защиту для неавторизованных POST-запросов)
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};
// ------------------------------------------------------------------

/**
 * Модальное окно для создания комментария.
 * @param {boolean} isAuth - Флаг, указывающий, авторизован ли пользователь.
 * @param {object} user - Объект с данными авторизованного пользователя ({ username, email }).
 * @param {function} onClose - Функция закрытия модального окна.
 * @param {function} onCommentCreated - Callback после успешного создания комментария.
 */
const CreateCommentModal = ({ isAuth = false, user = {}, onClose, onCommentCreated }) => {
    const [form, setForm] = useState({
        username: isAuth ? user.username || '' : '', 
        email: isAuth ? user.email || '' : '', 
        text: '',
        captcha_key: '',
        captcha_value: '',
    });
    const [captcha, setCaptcha] = useState({ key: '', image_url: '' });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({}); 
    const [success, setSuccess] = useState(false);

    // --- Логика CAPTCHA ---
    const fetchCaptcha = useCallback(() => {
        if (isAuth) return; 
        fetch('/api/captcha/') 
            .then(res => res.json())
            .then(data => {
                setCaptcha(data);
                setForm(f => ({ ...f, captcha_key: data.key, captcha_value: '' }));
            })
            .catch(() => setValidationErrors({ general: 'Ошибка загрузки CAPTCHA' }));
    }, [isAuth]);

    useEffect(() => {
        fetchCaptcha();
    }, [fetchCaptcha]);

    // --- Обработка ввода ---
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Очистка ошибки при начале ввода
        if (validationErrors[e.target.name] || validationErrors.general) {
            setValidationErrors({});
        }
    };

    // --- Отправка формы ---
    const handleSubmit = async e => {
        e.preventDefault();
        setValidationErrors({});
        setSuccess(false);
        setLoading(true);

        // --- 1. ФОРМИРОВАНИЕ ПОЛЕЗНОЙ НАГРУЗКИ (PAYLOAD) ---
        const payload = { 
            text: form.text, 
        };
        
        if (!isAuth) {
            // Обязательные поля для гостя
            payload.guest_name = form.username; 
            payload.guest_email = form.email; 
            payload.captcha_key = form.captcha_key;
            payload.captcha_value = form.captcha_value;
        }
        
        // --- 2. ФОРМИРОВАНИЕ ЗАГОЛОВКОВ ---
        const csrfToken = getCookie('csrftoken');
        const headers = { 
            'Content-Type': 'application/json',
            ...(csrfToken && { 'X-CSRFToken': csrfToken }), 
        };
        
        // Если авторизован, добавляем Bearer Token
        if (isAuth) {
            const token = localStorage.getItem('access'); // Используйте ваш реальный метод получения токена
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            const res = await fetch('/api/comments/', { // Ваш API endpoint для создания
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 400 && typeof data === 'object') {
                    // Обработка ошибок DRF
                    setValidationErrors(prev => ({
                        ...prev,
                        username: data.guest_name ? data.guest_name.join(' ') : null,
                        email: data.guest_email ? data.guest_email.join(' ') : null,
                        text: data.text ? data.text.join(' ') : null,
                        captcha_value: data.captcha ? data.captcha.join(' ') : null,
                        // Обработка non_field_errors
                        general: data.non_field_errors ? data.non_field_errors.join(' ') : (data.detail || null),
                    }));
                } else {
                    setValidationErrors({ general: data.detail || `Ошибка ${res.status}: Неизвестный ответ сервера.` });
                }
                
                throw new Error('Ошибка валидации или сервера');
            }
            
            setSuccess(true);
            setLoading(false);
            if (onCommentCreated) onCommentCreated(); // Вызов обновления списка
            onClose(); // Закрыть после успеха

        } catch (err) {
            setLoading(false);
            if (!isAuth) fetchCaptcha(); // Обновить капчу при ошибке
        }
    };
    
    // Функция для отображения ошибок
    const ErrorMessage = ({ field }) => {
        if (!validationErrors[field]) return null;
        return <div className="modal-error-field">{validationErrors[field]}</div>;
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{isAuth ? `Комментировать как ${user.username}` : 'Добавить комментарий'}</h2>
                
                {validationErrors.general && <div className="modal-error">{validationErrors.general}</div>}
                {success && <div className="modal-success">Комментарий успешно добавлен!</div>}

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* Поля для НЕавторизованного пользователя */}
                    {!isAuth && (
                        <>
                            <input 
                                name="username" 
                                placeholder="Имя (A-z, 0-9)" 
                                value={form.username} 
                                onChange={handleChange} 
                                required 
                                pattern="[A-Za-z0-9]+" 
                                title="Только латинские буквы и цифры"
                            />
                            <ErrorMessage field="username" />
                            
                            <input 
                                name="email" 
                                type="email" 
                                placeholder="Email" 
                                value={form.email} 
                                onChange={handleChange} 
                                required 
                            />
                            <ErrorMessage field="email" />
                        </>
                    )}

                    {/* Поле текста комментария (ОБЩЕЕ ДЛЯ ВСЕХ) */}
                    <textarea 
                        name="text" 
                        placeholder="Текст комментария (HTML-теги, кроме разрешенных, недопустимы)" 
                        value={form.text} 
                        onChange={handleChange} 
                        required 
                        rows="5"
                    />
                    <ErrorMessage field="text" />
                    
                    {/* CAPTCHA для НЕавторизованного пользователя */}
                    {!isAuth && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                                {captcha.image_url ? (
                                    <img 
                                        src={captcha.image_url} 
                                        alt="CAPTCHA" 
                                        style={{ height: 38, borderRadius: 6, border: '1px solid #e0e0e0' }} 
                                    />
                                ) : null}
                                <button type="button" onClick={fetchCaptcha} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
                                    Обновить
                                </button>
                            </div>
                            <input 
                                name="captcha_value" 
                                placeholder="Введите текст с картинки" 
                                value={form.captcha_value} 
                                onChange={handleChange} 
                                required 
                            />
                            <ErrorMessage field="captcha_value" />
                        </>
                    )}
                    
                    <button type="submit" disabled={loading}>
                        {loading ? 'Отправка...' : 'Добавить комментарий'}
                    </button>
                </form>
                <button className="modal-close" onClick={onClose}>Закрыть</button>
            </div>
        </div>
    );
};

export default CreateCommentModal;
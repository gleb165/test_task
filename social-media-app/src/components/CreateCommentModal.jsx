import React, { useState, useEffect, useCallback } from 'react';
import './Modal.css';

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

const CreateCommentModal = ({ isAuth = false, user = {}, parentId = null, onClose, onCommentCreated }) => {
    const [form, setForm] = useState({
        text: '',
        ...(isAuth
            ? {}
            : { username: '', email: '', captcha_key: '', captcha_value: '' }
        )
    });

    const [captcha, setCaptcha] = useState({ key: '', image_url: '' });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState(false);

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

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (validationErrors[e.target.name] || validationErrors.general) {
            setValidationErrors({});
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setValidationErrors({});
        setSuccess(false);
        setLoading(true);

        // PAYLOAD
        const payload = { text: form.text };

        if (parentId) {
            payload.parent = parentId;
        }
        

        if (!isAuth) {
            payload.guest_name = form.username;
            payload.guest_email = form.email;
            payload.captcha_key = form.captcha_key;
            payload.captcha_value = form.captcha_value;
        }

        const csrfToken = getCookie('csrftoken');
        const headers = {
            'Content-Type': 'application/json',
            ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        };

        if (isAuth) {
            const token = localStorage.getItem('access');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const url = parentId
            ? `/api/comments/${parentId}/replies/`
            : '/api/comments/';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400 && typeof data === 'object') {
                    setValidationErrors({
                        text: data.text?.join(' '),
                        username: data.guest_name?.join(' '),
                        email: data.guest_email?.join(' '),
                        captcha_value: data.captcha?.join(' '),
                        general: data.non_field_errors?.join(' ') || data.detail,
                    });
                } else {
                    setValidationErrors({
                        general: data.detail || `Ошибка ${res.status}`
                    });
                }
                throw new Error('Ошибка отправки');
            }

            setSuccess(true);
            setLoading(false);
            onCommentCreated && onCommentCreated();
            onClose();

        } catch (err) {
            setLoading(false);
            if (!isAuth) fetchCaptcha();
        }
    };

    const ErrorMessage = ({ field }) =>
        validationErrors[field] ? (
            <div className="modal-error-field">{validationErrors[field]}</div>
        ) : null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{isAuth ? `Комментировать как ${user.username}` : 'Добавить комментарий'}</h2>

                {validationErrors.general && <div className="modal-error">{validationErrors.general}</div>}

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* НЕавторизованный пользователь */}
                    {!isAuth && (
                        <>
                            <input
                                name="username"
                                placeholder="Имя"
                                value={form.username}
                                onChange={handleChange}
                                required
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

                    {/* Текст комментария */}
                    <textarea
                        name="text"
                        placeholder="Ваш комментарий..."
                        value={form.text}
                        onChange={handleChange}
                        required
                        rows="5"
                    />
                    <ErrorMessage field="text" />

                    {/* CAPTCHA — только для гостей */}
                    {!isAuth && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                                {captcha.image_url && (
                                    <img
                                        src={captcha.image_url}
                                        alt="CAPTCHA"
                                        style={{ height: 38, borderRadius: 6, border: "1px solid #e0e0e0" }}
                                    />
                                )}
                                <button type="button" onClick={fetchCaptcha} className="modal-captcha-refresh">
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

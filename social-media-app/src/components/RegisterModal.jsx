import React, { useState, useEffect } from 'react';
import './Modal.css';

const RegisterModal = ({ onClose }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    captcha_key: '',
    captcha_value: '',
    first_name: '',
    last_name: '',
  });
  const [captcha, setCaptcha] = useState({ key: '', image_url: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/captcha/')
      .then(res => res.json())
      .then(data => {
        setCaptcha(data);
        setForm(f => ({ ...f, captcha_key: data.key }));
      });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.captcha || data?.password || 'Ошибка регистрации');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const reloadCaptcha = () => {
    fetch('/api/captcha/')
      .then(res => res.json())
      .then(data => {
        setCaptcha(data);
        setForm(f => ({ ...f, captcha_key: data.key }));
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input name="username" placeholder="Имя пользователя" value={form.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="first_name" placeholder="Имя" value={form.first_name} onChange={handleChange} />
          <input name="last_name" placeholder="Фамилия" value={form.last_name} onChange={handleChange} />
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {captcha.image_url ? (
              <img src={captcha.image_url} alt="captcha" style={{ height: 38, borderRadius: 6, border: '1px solid #e0e0e0' }} />
            ) : null}
            <button type="button" onClick={reloadCaptcha} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>Обновить</button>
          </div>
          <input name="captcha_value" placeholder="Введите текст с картинки" value={form.captcha_value} onChange={handleChange} required />
          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">Регистрация успешна! Проверьте почту для активации.</div>}
          <button type="submit">Зарегистрироваться</button>
        </form>
        <button className="modal-close" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default RegisterModal;

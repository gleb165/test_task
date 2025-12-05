import React, { useState } from 'react';
import './Modal.css';

const LoginModal = ({ onClose, onLogin }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data?.detail || 'Ошибка авторизации');
  
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
  
      setSuccess(true);
  
      if (onLogin) onLogin(data.user);
  
      setTimeout(() => {
        window.location.reload(); 
      }, 800);
  
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Вход</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input name="email" placeholder="Email пользователя" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">Вход выполнен успешно!</div>}
          <button type="submit">Войти</button>
        </form>
        <button className="modal-close" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default LoginModal;

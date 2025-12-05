import React, { useState, useEffect } from 'react';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';
import './Navbar.css';

const Navbar = ({ onUserClick }) => { 
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-actions">
          {!user ? (
            <>
              <button onClick={() => setShowRegister(true)}>Регистрация</button>
              <button onClick={() => setShowLogin(true)}>Вход</button>
            </>
          ) : (
            <>
              <button
                className="navbar-profile"
                onClick={() => onUserClick(user.id)} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f8f8f8',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 'bold'
                }}
              >
                {user.username}
              </button>

              <button onClick={handleLogout}>Выйти</button>
            </>
          )}
        </div>
      </div>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏠 דירות נופש
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">ראשי</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">האזור שלי</Link>
              <Link to="/add-apartment" className="nav-link add-apartment-btn">+ הוסף דירה</Link>
              <span className="user-greeting">שלום, {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">יציאה</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">התחברות</Link>
              <Link to="/register" className="nav-link register-btn">הרשמה</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

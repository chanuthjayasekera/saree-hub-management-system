// src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useCart } from '../state/CartContext';
import styles from './Navbar.module.css';

function IconBag({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 7V6a5 5 0 0 1 10 0v1h2a1 1 0 0 1 1 1l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9a1 1 0 0 1 1-1h2Zm2 0h6V6a3 3 0 0 0-6 0v1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 6h14a1 1 0 0 1 .97 1.26l-1.6 6A2 2 0 0 1 17.94 15H8.1a2 2 0 0 1-1.95-1.55L4.2 4.9H2.6a1 1 0 1 1 0-2h2.4a1 1 0 0 1 .98.78L6.5 6Zm2.1 14a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Zm9.2 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Navbar(){
  const { isAuthed, isAdmin, me, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  // ✅ Brand destination changes for admin
  const brandDestination = isAdmin ? "/admin" : "/";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to={brandDestination} className={styles.brand}>
          Saree<span>Hub</span>
        </NavLink>

        <nav className={styles.nav}>

          {/* ✅ SHOW ONLY FOR NORMAL USERS */}
          {isAuthed && !isAdmin && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? styles.active : styles.link}
              >
                <IconBag className={styles.icon} />
                <span>Shop</span>
              </NavLink>

              <NavLink
                to="/checkout"
                className={({ isActive }) => isActive ? styles.active : styles.link}
              >
                <IconCart className={styles.icon} />
                <span>Cart</span>
                <span className={styles.badge}>
                  {items.length}
                </span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({isActive}) => isActive ? styles.active : styles.link}
              >
                Profile
              </NavLink>

              <NavLink
                to="/orders"
                className={({isActive}) => isActive ? styles.active : styles.link}
              >
                My Orders
              </NavLink>
            </>
          )}

          {/* ✅ ADMIN ONLY */}
          {isAuthed && isAdmin && (
            <NavLink
              to="/admin"
              className={({isActive}) => isActive ? styles.active : styles.link}
            >
              Admin Dashboard
            </NavLink>
          )}

          {/* ✅ AUTH BUTTON */}
          {!isAuthed ? (
            <NavLink
              to="/login"
              className={({isActive}) => isActive ? styles.active : styles.link}
            >
              Login
            </NavLink>
          ) : (
            <button
              className={styles.logout}
              onClick={() => {
                logout();
                navigate('/login'); // ✅ after logout go to login
              }}
              type="button"
            >
              Logout
              <span className={styles.meTag}>
                {me?.name || 'Admin'}
              </span>
            </button>
          )}

        </nav>
      </div>
    </header>
  );
}

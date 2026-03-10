// src/components/Footer.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Footer.module.css';

function IconPhone({ className }){
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.1 15.1 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z"
      />
    </svg>
  );
}

function IconMail({ className }){
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
      />
    </svg>
  );
}

function IconPin({ className }){
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
      />
    </svg>
  );
}

function IconClock({ className }){
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 11h5a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-2 0v5a1 1 0 0 0 1 1Z"
      />
    </svg>
  );
}

function IconShield({ className }){
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z"
      />
    </svg>
  );
}

export default function Footer(){
  // ✅ You can replace these with your real info later
  const phone = '+94 77 123 4567';
  const email = 'support@sareehub.lk';
  const address = 'Colombo, Sri Lanka';
  const hours = 'Mon–Sat: 9:00 AM – 7:00 PM';

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brandCol}>
            <div className={styles.brand}>Saree<span>Hub</span></div>
            <p className={styles.tagline}>
              Premium sarees, trusted quality, and smooth checkout—designed for a modern shopping experience.
            </p>

            <div className={styles.trustRow}>
              <span className={styles.trustPill}>
                <IconShield className={styles.smallIcon} />
                Secure checkout
              </span>
              <span className={styles.trustPill}>
                <IconShield className={styles.smallIcon} />
                Quality checked
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.col}>
            <h4 className={styles.h}>Quick Links</h4>
            <NavLink className={styles.a} to="/">Shop</NavLink>
            <NavLink className={styles.a} to="/checkout">Cart</NavLink>
            <NavLink className={styles.a} to="/orders">My Orders</NavLink>
            <NavLink className={styles.a} to="/profile">Profile</NavLink>
          </div>

          {/* Help */}
          <div className={styles.col}>
            <h4 className={styles.h}>Help</h4>
            <a className={styles.a} href="#shipping">Shipping & Delivery</a>
            <a className={styles.a} href="#returns">Returns & Exchange</a>
            <a className={styles.a} href="#payments">Payments</a>
            <a className={styles.a} href="#faq">FAQ</a>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h4 className={styles.h}>Contact</h4>

            <div className={styles.infoRow}>
              <IconPhone className={styles.icon} />
              <span className={styles.infoText}>{phone}</span>
            </div>

            <div className={styles.infoRow}>
              <IconMail className={styles.icon} />
              <span className={styles.infoText}>{email}</span>
            </div>

            <div className={styles.infoRow}>
              <IconPin className={styles.icon} />
              <span className={styles.infoText}>{address}</span>
            </div>

            <div className={styles.infoRow}>
              <IconClock className={styles.icon} />
              <span className={styles.infoText}>{hours}</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} SareeHub. All rights reserved.</span>
          <div className={styles.bottomLinks}>
            <a className={styles.bottomA} href="#privacy">Privacy</a>
            <a className={styles.bottomA} href="#terms">Terms</a>
            <a className={styles.bottomA} href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

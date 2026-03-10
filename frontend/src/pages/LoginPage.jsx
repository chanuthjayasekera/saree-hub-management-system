import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import styles from './LoginPage.module.css';

/* ---- Eye Icons ---- */
function EyeIcon(props){
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z"/>
    </svg>
  );
}

function EyeOffIcon(props){
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.15-2.15A10.78 10.78 0 0 1 12 19c-7 0-10-7-10-7a18.88 18.88 0 0 1 4.44-5.77L2 5.27Zm10 3.23a4 4 0 0 1 4 4 3.94 3.94 0 0 1-.46 1.84l-5.38-5.38A3.94 3.94 0 0 1 12 8.5Z"/>
    </svg>
  );
}

export default function LoginPage(){
  const { login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [mode, setMode] = useState(
    loc.pathname.includes('register') ? 'register' : 'login'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e){
    e.preventDefault();
    setError('');
    setLoading(true);

    try{
      if(mode === 'login'){
        await login(email, password);
      }else{
        if(password !== confirmPassword)
          throw new Error('Passwords do not match');
        if(!location.trim())
          throw new Error('Location is required');

        await register(name, email, password, location.trim());
      }

      nav('/');
    }catch(err){
      setError(err.message || 'Failed');
    }finally{
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.top}>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={styles.sub}>
            {mode === 'login'
              ? 'Login to continue shopping and track your orders.'
              : 'Register to purchase sarees and manage deliveries.'}
          </p>
        </div>

        <div className={styles.switchRow}>
          <button
            className={mode==='login'?styles.tabActive:styles.tab}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>

          <button
            className={mode==='register'?styles.tabActive:styles.tab}
            onClick={() => setMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  value={name}
                  onChange={e=>setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Location</span>
                <input
                  value={location}
                  onChange={e=>setLocation(e.target.value)}
                  placeholder="e.g. Colombo, Sri Lanka"
                  required
                />
              </label>
            </>
          )}

          <label className={styles.field}>
            <span>Email</span>
            <input
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
              required
            />
          </label>

          {/* Password */}
          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.passwordWrap}>
              <input
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eye}
                onClick={()=>setShowPass(p=>!p)}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label className={styles.field}>
              <span>Confirm Password</span>
              <div className={styles.passwordWrap}>
                <input
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={()=>setShowConfirm(p=>!p)}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>
          )}

          <button className={styles.primary} disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Register')}
          </button>
        </form>
      </section>
    </main>
  );
}

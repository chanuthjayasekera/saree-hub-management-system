import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../state/AuthContext';
import styles from './ProfilePage.module.css';

/* ---- Icons (no library needed) ---- */
function IconUser(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.2 0-8 2.3-8 5.2V22h16v-2.8C20 16.3 16.2 14 12 14Z"/>
    </svg>
  );
}

function IconMail(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/>
    </svg>
  );
}

function IconPin(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/>
    </svg>
  );
}

function IconLock(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M17 10h-1V8a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM10 8a2 2 0 0 1 4 0v2h-4V8Zm2 10a2 2 0 1 1 2-2 2 2 0 0 1-2 2Z"/>
    </svg>
  );
}

/* ---- Eye Icons ---- */
function EyeIcon(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z"/>
    </svg>
  );
}

function EyeOffIcon(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M2 5.27 3.28 4 20 20.72 18.73 22l-2.15-2.15A10.78 10.78 0 0 1 12 19c-7 0-10-7-10-7a18.88 18.88 0 0 1 4.44-5.77L2 5.27Zm10 3.23a4 4 0 0 1 4 4 3.94 3.94 0 0 1-.46 1.84l-5.38-5.38A3.94 3.94 0 0 1 12 8.5Z"/>
    </svg>
  );
}

export default function ProfilePage(){
  const { me, refreshMe, updateProfile } = useAuth();

  const [name, setName] = useState(me?.name || '');
  const [location, setLocation] = useState(me?.location || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // ✅ eye toggles
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => { try{ await refreshMe(); }catch{} })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setName(me?.name || '');
    setLocation(me?.location || '');
  }, [me?.name, me?.location]);

  const email = useMemo(() => me?.email || '', [me?.email]);

  async function save(e){
    e.preventDefault();
    setError('');
    setMsg('');

    if(!name.trim()) return setError('Name is required');
    if(!location.trim()) return setError('Location is required');

    if(newPassword){
      if(newPassword.length < 6) return setError('New password must be at least 6 characters');
      if(newPassword !== confirmNewPassword) return setError('New passwords do not match');
    }

    setLoading(true);
    try{
      await updateProfile({
        name: name.trim(),
        location: location.trim(),
        newPassword: newPassword ? newPassword : undefined
      });

      setNewPassword('');
      setConfirmNewPassword('');
      setShowNew(false);
      setShowConfirm(false);
      setMsg('Profile updated successfully ✅');
    }catch(err){
      setError(err?.message || 'Failed to update');
    }finally{
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.sub}>
              Update your delivery location. Orders will be delivered to this location.
            </p>
          </div>

          <div className={styles.badge}>
            <IconPin className={styles.badgeIcon} />
            <span>Delivery Profile</span>
          </div>
        </header>

        {error && <div className={`${styles.alert} ${styles.alertErr}`}>{error}</div>}
        {msg && <div className={`${styles.alert} ${styles.alertOk}`}>{msg}</div>}

        <form className={styles.form} onSubmit={save}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>
                <IconUser className={styles.icon} />
                Name
              </span>
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                <IconMail className={styles.icon} />
                Email
              </span>
              <input value={email} disabled />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>
              <IconPin className={styles.icon} />
              Delivery Location
            </span>
            <input
              value={location}
              onChange={e=>setLocation(e.target.value)}
              placeholder="e.g. 12, Main Road, Colombo"
            />
            <p className={styles.hint}>
              Tip: add a clear landmark / street name for faster delivery.
            </p>
          </label>

          <div className={styles.divider}>
            <span>
              <IconLock className={styles.divIcon} />
              Security
            </span>
          </div>

          <div className={styles.grid}>
            {/* ✅ New Password with eye */}
            <label className={styles.field}>
              <span className={styles.label}>
                <IconLock className={styles.icon} />
                New Password (optional)
              </span>

              <div className={styles.passwordWrap}>
                <input
                  value={newPassword}
                  onChange={e=>setNewPassword(e.target.value)}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowNew(v => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {/* ✅ Confirm Password with eye */}
            <label className={styles.field}>
              <span className={styles.label}>
                <IconLock className={styles.icon} />
                Confirm New Password
              </span>

              <div className={styles.passwordWrap}>
                <input
                  value={confirmNewPassword}
                  onChange={e=>setConfirmNewPassword(e.target.value)}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>
          </div>

          <button className={styles.primary} disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </section>
    </main>
  );
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthCtx = createContext(null);
const LS_KEY = 'saree_auth';

export function AuthProvider({ children }){
  const [session, setSession] = useState(null); // { token, user }

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      try{ setSession(JSON.parse(raw)); }catch{}
    }
  }, []);

  function persist(next){
    setSession(next);
    if(next) localStorage.setItem(LS_KEY, JSON.stringify(next));
    else localStorage.removeItem(LS_KEY);
  }

  async function login(email, password){
    const res = await api.auth.login({ email, password });
    persist(res);
    return res;
  }

  async function register(name, email, password, location){
    const res = await api.auth.register({ name, email, password, location });
    persist(res);
    return res;
  }

  async function refreshMe(){
    if(!session?.token) return null;
    const me = await api.users.me(session.token);
    const next = { ...session, user: { ...session.user, ...me } };
    persist(next);
    return next.user;
  }

  async function updateProfile(payload){
    if(!session?.token) throw new Error('Not logged in');
    const me = await api.users.updateMe(payload, session.token);
    const next = { ...session, user: { ...session.user, ...me } };
    persist(next);
    return next.user;
  }

  function logout(){
    persist(null);
  }

  const value = useMemo(() => ({
    session,
    token: session?.token || null,
    me: session?.user || null,
    isAuthed: !!session?.token,
    isAdmin: session?.user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshMe,
    updateProfile
  }), [session]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(){
  return useContext(AuthCtx);
}

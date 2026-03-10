import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export default function ProtectedRoute({ children, adminOnly=false }){
  const { isAuthed, isAdmin } = useAuth();

  if(!isAuthed) return <Navigate to="/login" replace />;
  if(adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}

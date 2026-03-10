import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
const LS_KEY = 'saree_cart';

export function CartProvider({ children }){
  const [items, setItems] = useState([]); // [{ saree, qty }]

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      try{ setItems(JSON.parse(raw)); }catch{}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function add(saree, qty=1){
    setItems(prev => {
      const id = saree._id;
      const found = prev.find(p => p.saree._id === id);
      if(found){
        return prev.map(p => p.saree._id === id ? { ...p, qty: p.qty + qty } : p);
      }
      return [...prev, { saree, qty }];
    });
  }

  function setQty(id, qty){
    const q = Math.max(1, Number(qty) || 1);
    setItems(prev => prev.map(p => p.saree._id === id ? { ...p, qty: q } : p));
  }

  function remove(id){
    setItems(prev => prev.filter(p => p.saree._id !== id));
  }

  function clear(){ setItems([]); }

  const total = useMemo(() => items.reduce((sum, it) => sum + (Number(it.saree.price)||0)*it.qty, 0), [items]);

  const value = useMemo(() => ({ items, add, setQty, remove, clear, total }), [items, total]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart(){ return useContext(CartCtx); }

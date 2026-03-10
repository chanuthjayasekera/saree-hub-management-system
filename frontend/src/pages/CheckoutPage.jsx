// src/pages/CheckoutPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { api, API_BASE } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.css';

function money(v){
  try{
    return new Intl.NumberFormat('en-LK', { style:'currency', currency:'LKR' }).format(Number(v)||0);
  }catch{
    return `Rs ${Number(v)||0}`;
  }
}

function normalizeColorList(colors){
  if(!colors) return [];
  if(Array.isArray(colors)){
    const arr = colors.map(c => String(c||'').trim()).filter(Boolean);
    // ✅ Fix legacy bug: ['r','e','d'] => ['red']
    if(arr.length > 1 && arr.every(x => x.length === 1)) return [arr.join('')];
    return arr;
  }
  return [String(colors).trim()].filter(Boolean);
}

function safePhotoSrc(src){
  if(!src) return '';
  if(/^https?:\/\//i.test(src)) return src;
  return `${API_BASE}${src}`;
}

/* ---- Icons (no library needed) ---- */
function IconCash(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm2 0v10h14V7H5Zm7 1.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5Z"/>
    </svg>
  );
}

function IconCard(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm2 0v2h14V6H6Zm14 4H6v8h14v-8Zm-11 5h6v2H9v-2Z"/>
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

function IconSteps(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M6 3h6v6H6V3Zm6 6h6v6h-6V9ZM6 15h6v6H6v-6Z"/>
    </svg>
  );
}

/* ---- Card helpers ---- */
function digitsOnly(s=''){ return String(s).replace(/\D/g, ''); }
function formatCardNumber(v=''){
  const d = digitsOnly(v).slice(0, 19);
  return d.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v=''){
  const d = digitsOnly(v).slice(0, 4);
  if(d.length <= 2) return d;
  return `${d.slice(0,2)}/${d.slice(2)}`;
}
function isValidExpiry(mmYY=''){
  const m = String(mmYY || '').trim();
  if(!/^\d{2}\/\d{2}$/.test(m)) return false;
  const [mm, yy] = m.split('/').map(n => Number(n));
  if(mm < 1 || mm > 12) return false;

  const now = new Date();
  const curYY = Number(String(now.getFullYear()).slice(-2));
  const curMM = now.getMonth() + 1;
  if(yy < curYY) return false;
  if(yy === curYY && mm < curMM) return false;
  return true;
}

export default function CheckoutPage(){
  const { items, setQty, remove, clear, total } = useCart();
  const { isAuthed, token, me, refreshMe } = useAuth();
  const nav = useNavigate();

  const [method, setMethod] = useState('CASH'); // CASH | CARD

  // ✅ Selected color per sareeId
  const [selectedColor, setSelectedColor] = useState({}); // { [sareeId]: "red" }

  // ✅ Card fields (UI only)
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ redirect countdown
  const REDIRECT_SECONDS = 5; // change to 5 if you want slower
  const [redirectIn, setRedirectIn] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // ✅ payload now includes selectedColor
  const cartPayload = useMemo(
    () => items.map(it => ({
      sareeId: it.saree._id,
      qty: Number(it.qty) || 1,
      selectedColor: selectedColor[it.saree._id] || null
    })),
    [items, selectedColor]
  );

  useEffect(() => {
    (async () => { try{ await refreshMe(); }catch{} })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ initialize default selected color when items change
  useEffect(() => {
    setSelectedColor(prev => {
      const next = { ...prev };
      for(const it of items){
        const id = it?.saree?._id;
        if(!id) continue;

        const colors = normalizeColorList(it?.saree?.colors);
        if(colors.length === 0) continue;

        if(!next[id]) next[id] = colors[0];
      }
      return next;
    });
  }, [items]);

  // ✅ reset messages & countdown when switching method
  useEffect(() => {
    setError('');
    setSuccess('');
    setRedirectIn(0);
    if(timerRef.current) clearTimeout(timerRef.current);
    if(intervalRef.current) clearInterval(intervalRef.current);
  }, [method]);

  // ✅ cleanup on unmount
  useEffect(() => {
    return () => {
      if(timerRef.current) clearTimeout(timerRef.current);
      if(intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function validateCard(){
    const holder = String(cardHolder || '').trim();
    const num = digitsOnly(cardNumber);
    const cv = digitsOnly(cvc);

    if(!holder) return 'Please enter card holder name.';
    if(num.length < 13 || num.length > 19) return 'Please enter a valid card number.';
    if(!isValidExpiry(expiry)) return 'Please enter a valid expiry (MM/YY).';
    if(cv.length < 3 || cv.length > 4) return 'Please enter a valid CVC (3–4 digits).';

    return '';
  }

  function startRedirectCountdown(){
    // stop any existing timers
    if(timerRef.current) clearTimeout(timerRef.current);
    if(intervalRef.current) clearInterval(intervalRef.current);

    setRedirectIn(REDIRECT_SECONDS);

    // countdown tick
    intervalRef.current = setInterval(() => {
      setRedirectIn(prev => {
        if(prev <= 1){
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // actual navigate (after N seconds)
    timerRef.current = setTimeout(() => {
      nav('/orders');
    }, REDIRECT_SECONDS * 1000);
  }

  async function placeOrder(){
    setError('');
    setSuccess('');

    // stop previous redirect if user tries again
    setRedirectIn(0);
    if(timerRef.current) clearTimeout(timerRef.current);
    if(intervalRef.current) clearInterval(intervalRef.current);

    if(items.length === 0){
      setError('Cart is empty.');
      return;
    }
    if(!isAuthed){
      setError('Please login to complete payment.');
      return;
    }
    if(!me?.location){
      setError('Please add your delivery location in Profile before placing an order.');
      return;
    }

    // ✅ ensure each item has a chosen color if colors exist
    for(const it of items){
      const id = it?.saree?._id;
      if(!id) continue;

      const colors = normalizeColorList(it?.saree?.colors);
      if(colors.length > 0 && !selectedColor[id]){
        setError(`Please select a color for: ${it?.saree?.description || 'item'}`);
        return;
      }
    }

    // ✅ card validation if CARD selected
    if(method === 'CARD'){
      const msg = validateCard();
      if(msg){
        setError(msg);
        return;
      }
    }

    setLoading(true);
    try{
      const payload = {
        items: cartPayload,
        paymentMethod: method,
        ...(method === 'CARD'
          ? {
              paymentDetails: {
                cardHolder: String(cardHolder || '').trim(),
                last4: digitsOnly(cardNumber).slice(-4),
                expiry: String(expiry || '').trim()
              }
            }
          : {})
      };

      await api.orders.create(payload, token);
      clear();

      const locText = me?.location ? `We will deliver to: ${me.location}.` : '';
      const etaText = method === 'CARD'
        ? 'Payment successful. Delivery: within 3 service days.'
        : 'Cash on delivery (door payment).';

      setSuccess(`Order placed! ${etaText} ${locText}`);
      startRedirectCountdown(); // ✅ stay a bit, then go to /orders
    }catch(e){
      setError(e?.message || 'Failed to place order');
    }finally{
      setLoading(false);
    }
  }

  const totalLabel = method === 'CASH' ? 'Cash on Delivery Total' : 'Card Payment Total';
  const isRedirecting = redirectIn > 0;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>Checkout</h1>

            <div className={styles.infoBar}>
              <span className={styles.infoItem}>
                {method === 'CASH'
                  ? <IconCash className={styles.infoIcon} />
                  : <IconCard className={styles.infoIcon} />
                }
                <span>Pay by {method === 'CASH' ? 'Cash on Delivery' : 'Card'}.</span>
              </span>

              <span className={styles.infoItem}>
                <IconPin className={styles.infoIcon} />
                <span>Deliver to your Profile location.</span>
              </span>

              <span className={styles.infoItem}>
                <IconSteps className={styles.infoIcon} />
                <span>Stages: Pending → Verifying → Accepted → Done (or Rejected).</span>
              </span>
            </div>
          </div>

          <Link className={styles.back} to="/">← Continue shopping</Link>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        {success && (
          <div className={styles.success}>
            {success}
            {isRedirecting && (
              <div style={{ marginTop: 6, opacity: 0.95, fontWeight: 900 }}>
                Redirecting to My Orders in {redirectIn}s…
              </div>
            )}
          </div>
        )}

        <div className={styles.grid}>
          <section className={styles.cart}>
            <h2 className={styles.h2}>Your Cart</h2>

            {items.length === 0 ? (
              <div className={styles.empty}>
                No items. Go to <Link to="/">Shop</Link>.
              </div>
            ) : (
              <div className={styles.items}>
                {items.map(({ saree, qty }) => {
                  const colorsArr = normalizeColorList(saree.colors);
                  const id = saree._id;
                  const chosen = selectedColor[id] || '';
                  const lineTotal = (Number(saree.price) || 0) * (Number(qty) || 1);

                  return (
                    <div className={styles.row} key={id}>
                      <img
                        className={styles.thumb}
                        src={safePhotoSrc(saree.photos?.[0])}
                        alt={saree.description}
                      />

                      <div className={styles.rowMid}>
                        <div className={styles.rowTitle}>{saree.description}</div>

                        <div className={styles.rowMeta}>
                          {money(saree.price)}
                          <span className={styles.dotSep}>•</span>
                          {colorsArr.slice(0, 3).join(', ') || '-'}
                        </div>

                        {colorsArr.length > 0 && (
                          <div className={styles.colorPickRow}>
                            <span className={styles.colorPickLabel}>Selected Color</span>

                            <div className={styles.colorPickRight}>
                              <select
                                className={styles.colorSelect}
                                value={chosen}
                                onChange={(e) =>
                                  setSelectedColor(prev => ({ ...prev, [id]: e.target.value }))
                                }
                                aria-label="Select color"
                              >
                                {colorsArr.map((c, i) => (
                                  <option key={`${c}-${i}`} value={c}>{c}</option>
                                ))}
                              </select>

                              <span className={styles.colorChip} title={chosen}>
                                {chosen}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={styles.qty}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => setQty(id, Math.max(1, (Number(qty)||1) - 1))}
                            aria-label="Decrease quantity"
                            disabled={loading || isRedirecting}
                          >
                            −
                          </button>

                          <input
                            className={styles.qtyInput}
                            value={qty}
                            onChange={e => setQty(id, e.target.value)}
                            inputMode="numeric"
                            aria-label="Quantity"
                            disabled={loading || isRedirecting}
                          />

                          <button
                            className={styles.qtyBtn}
                            onClick={() => setQty(id, (Number(qty)||1) + 1)}
                            aria-label="Increase quantity"
                            disabled={loading || isRedirecting}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className={styles.rowRight}>
                        <div className={styles.lineTotal}>{money(lineTotal)}</div>
                        <button
                          className={styles.remove}
                          onClick={() => remove(id)}
                          disabled={loading || isRedirecting}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={styles.pay}>
            <h2 className={styles.h2}>Payment</h2>

            <div className={styles.methodRow}>
              <button
                className={method==='CASH' ? styles.methodActive : styles.method}
                onClick={() => setMethod('CASH')}
                type="button"
                disabled={loading || isRedirecting}
              >
                Cash
              </button>
              <button
                className={method==='CARD' ? styles.methodActive : styles.method}
                onClick={() => setMethod('CARD')}
                type="button"
                disabled={loading || isRedirecting}
              >
                Card
              </button>
            </div>

            {method === 'CARD' && (
              <div className={styles.cardBox}>
                <div className={styles.field}>
                  <span>Card Holder Name</span>
                  <input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. Nimal Perera"
                    autoComplete="cc-name"
                    disabled={loading || isRedirecting}
                  />
                </div>

                <div className={styles.field}>
                  <span>Card Number</span>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    disabled={loading || isRedirecting}
                  />
                </div>

                <div className={styles.two}>
                  <div className={styles.field}>
                    <span>Expiry (MM/YY)</span>
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="08/28"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      disabled={loading || isRedirecting}
                    />
                  </div>

                  <div className={styles.field}>
                    <span>CVC</span>
                    <input
                      value={cvc}
                      onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0,4))}
                      placeholder="123"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      disabled={loading || isRedirecting}
                    />
                  </div>
                </div>

                <div className={styles.cardNote}>
                  We never store full card details. This is a demo-style card form.
                </div>
              </div>
            )}

            <div className={styles.summary}>
              <div className={styles.sumRow}>
                <span>{totalLabel}</span>
                <b>{money(total)}</b>
              </div>

              {!isAuthed && (
                <div className={styles.loginHint}>
                  Please <Link to="/login">login</Link> to pay.
                </div>
              )}

              <button
                className={styles.payBtn}
                onClick={placeOrder}
                disabled={loading || items.length === 0 || isRedirecting}
              >
                {loading ? 'Processing…' : (isRedirecting ? `Redirecting in ${redirectIn}s…` : `Pay ${money(total)}`)}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

// src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../state/AuthContext';
import styles from './OrdersPage.module.css';

function money(v){
  try{
    return new Intl.NumberFormat('en-LK', { style:'currency', currency:'LKR' }).format(Number(v)||0);
  }catch{
    return `Rs ${Number(v)||0}`;
  }
}

function safePhotoSrc(src){
  if(!src) return '';
  if(/^https?:\/\//i.test(src)) return src;
  return `${API_BASE}${src}`;
}

function pillClass(status){
  const s = String(status||'').toUpperCase();
  if(s === 'DONE') return styles.done;
  if(s === 'ACCEPTED') return styles.accepted;
  if(s === 'VERIFYING') return styles.verifying;
  if(s === 'REJECTED') return styles.rejected;
  return styles.pending;
}

/* ✅ robust: tries common timestamp keys */
function getOrderTimestamp(o){
  return (
    o?.createdAt ||
    o?.created_at ||
    o?.created ||
    o?.placedAt ||
    o?.placed_at ||
    o?.updatedAt ||
    o?.updated_at ||
    null
  );
}

function formatWhen(v){
  if(!v) return '';
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return '';
  try{
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }catch{
    return d.toLocaleString();
  }
}

/* ---- Icons ---- */
function IconSteps(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M6 3h6v6H6V3Zm6 6h6v6h-6V9ZM6 15h6v6H6v-6Z"/>
    </svg>
  );
}
function IconRefresh(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 0 1-8.66 3.54l-1.42 1.42A7 7 0 0 0 19 13c0-3.87-3.13-7-7-7Z"/>
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
function IconClock(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 8a1 1 0 0 1 1 1v3.25l2 1.2a1 1 0 1 1-1 1.73l-2.5-1.5A1 1 0 0 1 11 13V9a1 1 0 0 1 1-1Zm0-6a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.01 8.01 0 0 1 8-8Z"/>
    </svg>
  );
}
function IconSearch(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M10 2a8 8 0 1 0 4.9 14.32l4.39 4.39a1 1 0 0 0 1.42-1.42l-4.39-4.39A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1-6 6 6 6 0 0 1 6-6Z"/>
    </svg>
  );
}

export default function OrdersPage(){
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ NEW: search + status filter
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL'); // ALL | PENDING | ...

  async function load(){
    setLoading(true);
    setError('');
    try{
      const data = await api.orders.mine(token);
      setOrders(Array.isArray(data) ? data : []);
    }catch(e){
      setError(e?.message || 'Failed to load orders');
      setOrders([]);
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filteredOrders = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    const need = String(status || 'ALL').toUpperCase();

    return (orders || []).filter(o => {
      const st = String(o?.status || 'PENDING').toUpperCase();
      if(need !== 'ALL' && st !== need) return false;

      if(!q) return true;

      const when = formatWhen(getOrderTimestamp(o)).toLowerCase();
      const pay = String(o?.paymentMethod || '').toLowerCase();
      const last4 = String(o?.cardLast4 || o?.paymentDetails?.last4 || '').toLowerCase();
      const totalTxt = String(o?.total ?? '').toLowerCase();
      const loc = String(o?.deliveryLocation || '').toLowerCase();

      const itemTitles = (o?.items || [])
        .map(it => String(it?.title || it?.saree?.description || '').toLowerCase())
        .join(' ');

      const hay = [when, pay, last4, totalTxt, loc, st.toLowerCase(), itemTitles].join(' • ');
      return hay.includes(q);
    });
  }, [orders, query, status]);

  const empty = useMemo(
    () => !loading && !error && filteredOrders.length === 0,
    [loading, error, filteredOrders]
  );

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>My Orders</h1>

            <div className={styles.infoBar}>
              <span className={styles.infoItem}>
                <IconSteps className={styles.infoIcon} />
                <span>Stages: Pending → Verifying → Accepted → Done (or Rejected)</span>
              </span>

              <span className={styles.infoItem}>
                <IconPin className={styles.infoIcon} />
                <span>Delivery goes to your saved location</span>
              </span>
            </div>
          </div>

          <button className={styles.refresh} onClick={load} type="button">
            <IconRefresh className={styles.refreshIcon} />
            Refresh
          </button>
        </header>

        {/* ✅ NEW: Search + Filter */}
        <div className={styles.tools}>
          <div className={styles.searchWrap}>
            <IconSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: item, date, location, payment, total…"
            />
            {query && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.filterWrap}>
            <span className={styles.filterLabel}>Status</span>
            <select
              className={styles.filterSelect}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFYING">Verifying</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DONE">Done</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className={styles.resultCount}>
            {filteredOrders.length} order(s)
          </div>
        </div>

        {loading && <div className={styles.state}>Loading…</div>}
        {error && <div className={styles.error}>{error}</div>}
        {empty && <div className={styles.state}>No orders match your search/filter.</div>}

        <div className={styles.list}>
          {filteredOrders.map(o => {
            const when = formatWhen(getOrderTimestamp(o));
            const last4 = o.cardLast4 || o?.paymentDetails?.last4 || '----';

            return (
              <article className={styles.card} key={o._id}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.meta}>
                      <span className={styles.paid}>
                        {o.paymentMethod === 'CARD'
                          ? `Card • **** ${last4}`
                          : 'Cash on Delivery'}
                      </span>

                      {when && (
                        <>
                          <span className={styles.dot}>•</span>
                          <span className={styles.when}>
                            <IconClock className={styles.whenIcon} />
                            <span>{when}</span>
                          </span>
                        </>
                      )}

                      <span className={styles.dot}>•</span>
                      <span className={styles.total}>{money(o.total)}</span>

                      <span className={styles.dot}>•</span>
                      <span className={styles.loc}>
                        Deliver to: {o.deliveryLocation || '-'}
                      </span>
                    </div>
                  </div>

                  <div className={`${styles.pill} ${pillClass(o.status)}`}>
                    {String(o.status || 'PENDING').toUpperCase()}
                  </div>
                </div>

                <div className={styles.items}>
                  {(o.items || []).map((it, idx) => {
                    const img = it?.saree?.photos?.[0] || '';
                    const title = it?.title || it?.saree?.description || 'Item';
                    const price = Number(it?.priceAtPurchase) || 0;
                    const qty = Number(it?.qty) || 1;

                    return (
                      <div className={styles.item} key={idx}>
                        <img
                          className={styles.thumb}
                          src={safePhotoSrc(img)}
                          alt={title}
                        />

                        <div className={styles.itemMid}>
                          <div className={styles.itemTitle}>{title}</div>
                          <div className={styles.itemMeta}>
                            {money(price)} × {qty}
                          </div>
                        </div>

                        <div className={styles.itemRight}>
                          {money(price * qty)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {o.note ? (
                  <div className={styles.note}>
                    <b>Admin note:</b> {o.note}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

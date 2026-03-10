// src/pages/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../state/AuthContext';
import styles from './AdminPage.module.css';

function money(v){
  try{
    return new Intl.NumberFormat('en-LK', { style:'currency', currency:'LKR' }).format(Number(v)||0);
  }catch{
    return `Rs ${Number(v)||0}`;
  }
}

function statusPillClass(status){
  const s = String(status||'').toUpperCase();
  if(s === 'DONE') return styles.done;
  if(s === 'ACCEPTED') return styles.accepted;
  if(s === 'VERIFYING') return styles.verifying;
  if(s === 'REJECTED') return styles.rejected;
  return styles.pending;
}

function safePhotoSrc(src){
  if(!src) return '';
  if(/^https?:\/\//i.test(src)) return src;
  return `${API_BASE}${src}`;
}

// ✅ keeps legacy bug fixed: ['r','e','d'] => ['red']
function normalizeColorList(colors){
  if(!colors) return [];
  if(Array.isArray(colors)){
    const arr = colors.map(c => String(c||'').trim()).filter(Boolean);
    if(arr.length > 1 && arr.every(x => x.length === 1)) return [arr.join('')];
    return arr;
  }
  return [String(colors).trim()].filter(Boolean);
}

/* ✅ robust timestamp getter */
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

/* ---- Icons (no library needed) ---- */
function IconRefresh(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 6V3L8 7l4 4V8a4 4 0 1 1-3.46 2H6.8A6 6 0 1 0 12 6Z"/>
    </svg>
  );
}
function IconPlus(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"/>
    </svg>
  );
}
function IconTag(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M20.59 13.41 12 4.83V4H4v8h.83l8.58 8.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83ZM7.5 9A1.5 1.5 0 1 1 9 7.5 1.5 1.5 0 0 1 7.5 9Z"/>
    </svg>
  );
}
function IconOrders(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M7 2h10v2H7V2Zm-2 4h14v16H5V6Zm3 3v2h8V9H8Zm0 4v2h8v-2H8Z"/>
    </svg>
  );
}
function IconBox(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M21 7.5 12 3 3 7.5V16.5L12 21l9-4.5V7.5Zm-9 1.2 6.7-3.35L12 2.9 5.3 5.35 12 8.7ZM5 8.9l6 3v7.1l-6-3V8.9Zm14 7.1-6 3v-7.1l6-3V16Z"/>
    </svg>
  );
}
function IconUser(props){
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.2 0-8 2.3-8 5.2V22h16v-2.8C20 16.3 16.2 14 12 14Z"/>
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

const colorOptions = ['Red','Blue','Green','Black','White','Gold','Silver','Pink','Purple','Maroon','Orange','Yellow','Brown'];

function SareeForm({ initial=null, onClose, onSaved }){
  const { token } = useAuth();
  const editing = !!initial?._id;

  const [description, setDescription] = useState(initial?.description || '');
  const [colors, setColors] = useState(normalizeColorList(initial?.colors || []));
  const [dimensions, setDimensions] = useState(initial?.dimensions || '');
  const [weight, setWeight] = useState(initial?.weight || '');
  const [blouseLength, setBlouseLength] = useState(initial?.blouseLength || '');
  const [marketedBy, setMarketedBy] = useState(initial?.marketedBy || '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleColor(c){
    setColors(prev => prev.includes(c) ? prev.filter(x => x!==c) : [...prev, c]);
  }

  function pickFiles(e){
    const files = Array.from(e.target.files || []);
    const next = [...photos, ...files].slice(0,3);
    setPhotos(next);
  }

  async function submit(e){
    e.preventDefault();
    setError('');

    if(!description.trim()) return setError('Description is required');
    if(colors.length === 0) return setError('Select at least one color');
    if(!dimensions.trim()) return setError('Dimensions is required');
    if(!weight.trim()) return setError('Weight is required');
    if(!blouseLength.trim()) return setError('Blouse length is required');
    if(!marketedBy.trim()) return setError('Marketed by is required');

    const p = Number(price);
    if(!Number.isFinite(p) || p < 0) return setError('Price must be a valid number');

    setLoading(true);
    try{
      const fd = new FormData();
      fd.append('description', description.trim());
      colors.forEach(c => fd.append('colors', c));
      fd.append('dimensions', dimensions.trim());
      fd.append('weight', weight.trim());
      fd.append('blouseLength', blouseLength.trim());
      fd.append('marketedBy', marketedBy.trim());
      fd.append('price', String(p));
      fd.append('inStock', String(!!inStock));
      photos.forEach(f => fd.append('photos', f));

      if(editing){
        await api.sarees.update(initial._id, fd, token);
      }else{
        if(photos.length === 0) return setError('Please upload at least 1 image (max 3)');
        await api.sarees.create(fd, token);
      }

      onSaved();
      onClose();
    }catch(err){
      setError(err?.message || 'Failed to save');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onMouseDown={(e)=>e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <IconTag className={styles.modalTitleIcon} />
            <h2 className={styles.modalTitle}>{editing ? 'Edit Saree' : 'Add Saree'}</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className={`${styles.alert} ${styles.alertErr}`}>{error}</div>}

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span>Description</span>
            <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. Kanchipuram Silk Saree" />
          </label>

          <div className={styles.field}>
            <span>Colors</span>
            <div className={styles.colors}>
              {colorOptions.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleColor(c)}
                  className={colors.includes(c) ? styles.colorActive : styles.colorBtn}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className={styles.colorHint}>
              Selected: <b>{colors.join(', ') || '-'}</b>
            </div>
          </div>

          <div className={styles.two}>
            <label className={styles.field}>
              <span>Dimensions</span>
              <input value={dimensions} onChange={e=>setDimensions(e.target.value)} placeholder="e.g. 6.3m x 1.1m" />
            </label>
            <label className={styles.field}>
              <span>Weight</span>
              <input value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 450g" />
            </label>
          </div>

          <div className={styles.two}>
            <label className={styles.field}>
              <span>Blouse Length</span>
              <input value={blouseLength} onChange={e=>setBlouseLength(e.target.value)} placeholder="e.g. 0.8m" />
            </label>
            <label className={styles.field}>
              <span>Marketed By</span>
              <input value={marketedBy} onChange={e=>setMarketedBy(e.target.value)} placeholder="Brand / Seller" />
            </label>
          </div>

          <div className={styles.two}>
            <label className={styles.field}>
              <span>Price (LKR)</span>
              <input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" placeholder="e.g. 12500" />
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={!!inStock} onChange={e=>setInStock(e.target.checked)} />
              <span>In Stock</span>
            </label>
          </div>

          <div className={styles.field}>
            <span>{editing ? 'Add new images (optional, max 3)' : 'Images (1 to 3)'}</span>
            <input className={styles.fileInput} type="file" accept="image/*" multiple onChange={pickFiles} />
            {photos.length > 0 && <div className={styles.fileHint}>{photos.length} file(s) selected</div>}

            {editing && initial?.photos?.length ? (
              <div className={styles.prevRow}>
                {initial.photos.map((p, i) => (
                  <img key={i} className={styles.prevImg} src={safePhotoSrc(p)} alt="previous" />
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.formActionsSticky}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button className={styles.primaryModalBtn} disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage(){
  const { token } = useAuth();

  const [tab, setTab] = useState('sarees'); // sarees | orders
  const [sarees, setSarees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // ✅ NEW: search + status filter for Orders tab
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatus, setOrderStatusFilter] = useState('ALL'); // ALL | PENDING | ...

  async function load(){
    setLoading(true);
    setError('');
    try{
      const [s, o] = await Promise.all([
        api.sarees.list(),
        api.orders.all(token)
      ]);
      setSarees(Array.isArray(s) ? s : []);
      setOrders(Array.isArray(o) ? o : []);
    }catch(e){
      setError(e?.message || 'Failed to load admin data');
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const prev = document.body.style.overflow;
    if(showForm) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showForm]);

  async function removeSaree(id){
    const ok = window.confirm('Delete this saree?');
    if(!ok) return;
    setError('');
    try{
      await api.sarees.remove(id, token);
      setSarees(prev => prev.filter(x => x._id !== id));
    }catch(e){
      setError(e?.message || 'Failed to delete');
    }
  }

  async function setOrderStatus(id, status){
    setError('');
    try{
      const updated = await api.orders.setStatus(id, { status }, token);
      setOrders(prev => prev.map(o => o._id === id ? updated : o));
    }catch(e){
      setError(e?.message || 'Failed to update order');
    }
  }

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (Number(o.total)||0), 0),
    [orders]
  );

  // ✅ NEW: filtered orders
  const filteredOrders = useMemo(() => {
    const q = String(orderQuery || '').trim().toLowerCase();
    const statusNeed = String(orderStatus || 'ALL').toUpperCase();

    return (orders || []).filter(o => {
      const st = String(o?.status || 'PENDING').toUpperCase();
      if(statusNeed !== 'ALL' && st !== statusNeed) return false;

      if(!q) return true;

      const when = formatWhen(getOrderTimestamp(o)).toLowerCase();
      const userName = String(o?.user?.name || '').toLowerCase();
      const userEmail = String(o?.user?.email || '').toLowerCase();
      const loc = String(o?.deliveryLocation || o?.user?.location || '').toLowerCase();
      const pay = String(o?.paymentMethod || '').toLowerCase();
      const totalTxt = String(o?.total ?? '').toLowerCase();

      const itemTitles = (o?.items || [])
        .map(it => String(it?.title || it?.saree?.description || '').toLowerCase())
        .join(' ');

      const hay = [when, userName, userEmail, loc, pay, totalTxt, st.toLowerCase(), itemTitles].join(' • ');
      return hay.includes(q);
    });
  }, [orders, orderQuery, orderStatus]);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>

            <div className={styles.subRow}>
              <span className={styles.subPill}>
                <IconBox className={styles.subIcon} />
                <span>Manage sarees</span>
              </span>

              <span className={styles.subPill}>
                <IconOrders className={styles.subIcon} />
                <span>Verify orders</span>
              </span>

              <span className={styles.subPill}>
                <IconTag className={styles.subIcon} />
                <span>Total revenue: <b>{money(totalRevenue)}</b></span>
              </span>
            </div>
          </div>

          <div className={styles.headActions}>
            <button className={styles.refreshBtn} onClick={load} type="button">
              <IconRefresh className={styles.btnIcon} />
              Refresh
            </button>

            {tab === 'sarees' && (
              <button
                className={styles.primaryHeaderBtn}
                onClick={() => { setEditing(null); setShowForm(true); }}
                type="button"
              >
                <IconPlus className={styles.btnIcon} />
                Add Saree
              </button>
            )}
          </div>
        </header>

        <div className={styles.tabs}>
          <button className={tab==='sarees'?styles.tabActive:styles.tab} onClick={()=>setTab('sarees')} type="button">
            <IconBox className={styles.tabIcon} />
            Sarees
          </button>
          <button className={tab==='orders'?styles.tabActive:styles.tab} onClick={()=>setTab('orders')} type="button">
            <IconOrders className={styles.tabIcon} />
            Orders
          </button>
        </div>

        {loading && <div className={styles.state}>Loading…</div>}
        {error && <div className={`${styles.alert} ${styles.alertErr}`}>{error}</div>}

        {!loading && tab === 'sarees' && (
          <div className={styles.grid}>
            {sarees.map(s => {
              const colors = normalizeColorList(s.colors).slice(0,3).join(', ');
              return (
                <article className={styles.card} key={s._id}>
                  <div className={styles.imgWrap}>
                    <img className={styles.cardImg} src={safePhotoSrc(s.photos?.[0])} alt={s.description} />
                    <div className={styles.pricePill}>{money(s.price)}</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>{s.description}</div>
                    <div className={styles.meta}>
                      <span className={styles.metaLine}>
                        <span className={styles.metaLabel}>Colors</span>
                        <span className={styles.metaValue}>{colors || '-'}</span>
                      </span>
                      <span className={styles.metaLine}>
                        <span className={styles.metaLabel}>Stock</span>
                        <span className={styles.metaValue}>{s.inStock ? 'Available' : 'Out of stock'}</span>
                      </span>
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => { setEditing(s); setShowForm(true); }} type="button">
                        Edit
                      </button>
                      <button className={styles.deleteBtn} onClick={() => removeSaree(s._id)} type="button">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && tab === 'orders' && (
          <>
            {/* ✅ NEW: Search + Filter bar */}
            <div className={styles.orderTools}>
              <div className={styles.searchWrap}>
                <IconSearch className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Search orders: user, email, location, status, item, date…"
                />
                {orderQuery && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => setOrderQuery('')}
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
                  value={orderStatus}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
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

            <div className={styles.orderList}>
              {filteredOrders.map(o => {
                const when = formatWhen(getOrderTimestamp(o));
                const statusText = String(o.status || 'PENDING').toUpperCase();
                const last4 = o.cardLast4 || o?.paymentDetails?.last4 || '----';

                return (
                  <article className={styles.orderCard} key={o._id}>
                    <div className={styles.orderTop}>
                      <div>
                        <div className={styles.orderTitle}>Order</div>

                        <div className={styles.orderMeta}>
                          <span className={styles.metaChip}>
                            <IconUser className={styles.chipIcon} />
                            <b>{o.user?.name || 'User'}</b>
                            <span className={styles.muted}>({o.user?.email || '-'})</span>
                          </span>

                          <span className={styles.metaChip}>
                            <IconTag className={styles.chipIcon} />
                            <span>{money(o.total)}</span>
                          </span>

                          <span className={styles.metaChip}>
                            {o.paymentMethod === 'CARD'
                              ? <IconCard className={styles.chipIcon} />
                              : <IconCash className={styles.chipIcon} />
                            }
                            <span>{o.paymentMethod === 'CARD' ? `Card • **** ${last4}` : 'Cash'}</span>
                          </span>

                          {/* ✅ NEW: Date/Time chip */}
                          {when && (
                            <span className={styles.metaChip}>
                              <IconClock className={styles.chipIcon} />
                              <span>{when}</span>
                            </span>
                          )}

                          <span className={styles.metaChip}>
                            <IconPin className={styles.chipIcon} />
                            <span className={styles.loc}>Deliver to: {o.deliveryLocation || o.user?.location || '-'}</span>
                          </span>
                        </div>
                      </div>

                      <div className={`${styles.pill} ${statusPillClass(statusText)}`}>{statusText}</div>
                    </div>

                    <div className={styles.orderItems}>
                      {(o.items || []).map((it, idx) => (
                        <div className={styles.oi} key={idx}>
                          <img
                            className={styles.thumb}
                            src={safePhotoSrc(it?.saree?.photos?.[0] || '')}
                            alt={it?.title || 'Item'}
                          />
                          <div className={styles.oiMid}>
                            <div className={styles.oiTitle}>{it?.title || it?.saree?.description || 'Item'}</div>
                            <div className={styles.oiMeta}>{money(it?.priceAtPurchase)} × {it?.qty}</div>
                          </div>
                          <div className={styles.oiRight}>
                            {money((Number(it?.priceAtPurchase)||0) * (Number(it?.qty)||0))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.stageRow}>
                      <span className={styles.stageLabel}>Update status:</span>
                      {['PENDING','VERIFYING','ACCEPTED','DONE','REJECTED'].map(s => (
                        <button
                          key={s}
                          type="button"
                          className={String(o.status || 'PENDING').toUpperCase() === s ? styles.stageActive : styles.stageBtn}
                          onClick={() => setOrderStatus(o._id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            {!loading && filteredOrders.length === 0 && (
              <div className={styles.state}>No orders match your search/filter.</div>
            )}
          </>
        )}
      </section>

      {showForm && (
        <SareeForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={load}
        />
      )}
    </main>
  );
}

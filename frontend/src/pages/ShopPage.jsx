// src/pages/ShopPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { api, API_BASE } from '../services/api';
import { useCart } from '../state/CartContext';
import styles from './ShopPage.module.css';

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
    // Fix legacy bug: ['r','e','d'] => ['red']
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

function Media({ src, alt }){
  const url = safePhotoSrc(src);
  return <img className={styles.cardImg} src={url} alt={alt || 'Saree'} loading="lazy" />;
}

export default function ShopPage(){
  const { add } = useCart();

  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [idx, setIdx] = useState(0);

  // ✅ search
  const [q, setQ] = useState('');

  // ✅ toast popup
  const [toast, setToast] = useState({ show:false, text:'', type:'ok' });
  function showToast(text, type='ok'){
    setToast({ show:true, text, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast({ show:false, text:'', type:'ok' }), 2200);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try{
      const data = await api.sarees.list();
      setSarees(Array.isArray(data) ? data : []);
    }catch(e){
      setError(e?.message || 'Failed to load sarees');
      setSarees([]);
    }finally{
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openModal(s){
    setActive(s);
    setIdx(0);
    setOpen(true);
  }

  function closeModal(){
    setOpen(false);
    setActive(null);
    setIdx(0);
  }

  function next(){
    if(!active?.photos?.length) return;
    setIdx(i => (i + 1) % active.photos.length);
  }
  function prev(){
    if(!active?.photos?.length) return;
    setIdx(i => (i - 1 + active.photos.length) % active.photos.length);
  }

  // ✅ Keyboard controls
  useEffect(() => {
    if(!open) return;

    function onKey(e){
      if(e.key === 'Escape') closeModal();
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    }

    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, active?.photos?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function addToCart(item){
    if(!item?.inStock){
      showToast('Out of stock', 'bad');
      return;
    }
    add(item, 1);
    showToast('Added to cart ✅', 'ok');
  }

  // ✅ Only in-stock
  const featured = useMemo(() => sarees.filter(s => s.inStock), [sarees]);

  // ✅ Search filter
  const filtered = useMemo(() => {
    const query = String(q || '').trim().toLowerCase();
    if(!query) return featured;

    return featured.filter(s => {
      const desc = String(s?.description || '').toLowerCase();
      const marketedBy = String(s?.marketedBy || '').toLowerCase();
      const colors = normalizeColorList(s?.colors).join(' ').toLowerCase();

      return (
        desc.includes(query) ||
        marketedBy.includes(query) ||
        colors.includes(query)
      );
    });
  }, [featured, q]);

  return (
    <main className={styles.page}>
      {/* ✅ Toast */}
      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'ok' ? styles.toastOk : styles.toastBad}`}>
          {toast.text}
        </div>
      )}

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.title}>Find your perfect saree</h1>
            <p className={styles.subtitle}>
              New arrivals, detailed specs, and a simple checkout with Cash or Card.
            </p>

            {/* ✅ SEARCH BAR */}
            <div className={styles.searchWrap}>
              <input
                className={styles.searchInput}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sarees (red, silk, floral, marketed by...)"
              />
              {q && (
                <button className={styles.clearBtn} onClick={() => setQ('')} aria-label="Clear search">
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className={styles.heroRight}>
            <button className={styles.refresh} onClick={load} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        {loading && <div className={styles.state}>Loading…</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && featured.length === 0 && (
          <div className={styles.state}>No sarees available.</div>
        )}

        {!loading && !error && featured.length > 0 && filtered.length === 0 && (
          <div className={styles.noResults}>
            No results for <b>{q}</b>. Try another keyword.
          </div>
        )}

        <div className={styles.grid}>
          {filtered.map(s => {
            const colors = normalizeColorList(s.colors);

            return (
              <article className={styles.card} key={s._id}>
                <div
                  className={styles.imgWrap}
                  onClick={() => openModal(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' || e.key === ' ') openModal(s);
                  }}
                  aria-label="Open saree details"
                >
                  <Media src={s.photos?.[0]} alt={s.description} />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{s.description}</h3>
                    <span className={styles.pricePill}>{money(s.price)}</span>
                  </div>

                  <div className={styles.meta}>
                    <span className={styles.metaLine}>
                      <span className={styles.metaLabel}>Colors:</span>
                      <span className={styles.metaValue}>{colors.slice(0, 3).join(', ') || '-'}</span>
                    </span>

                    <span className={styles.metaLine}>
                      <span className={styles.metaLabel}>Stock:</span>
                      <span className={styles.metaValue}>Available</span>
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.secondary} onClick={() => openModal(s)}>View</button>
                    <button className={styles.primary} onClick={() => addToCart(s)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ✅ MODAL */}
      {open && active && (
        <div className={styles.modalBackdrop} onMouseDown={closeModal} role="dialog" aria-modal="true">
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalTop}>
              <div>
                <h2 className={styles.modalTitle}>{active.description}</h2>
                <p className={styles.modalSub}>
                  <span className={styles.priceStrong}>{money(active.price)}</span>
                  <span className={styles.sep}>•</span>
                  <span>{active.dimensions || '—'}</span>
                  <span className={styles.sep}>•</span>
                  <span>{active.weight || '—'}</span>
                </p>
              </div>

              <button className={styles.close} onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.gallery}>
                <button className={styles.navBtn} onClick={prev} aria-label="Previous">‹</button>

                <img
                  className={styles.galleryImg}
                  src={safePhotoSrc(active.photos?.[idx])}
                  alt="Saree"
                />

                <button className={styles.navBtn} onClick={next} aria-label="Next">›</button>

                <div className={styles.dots}>
                  {(active.photos || []).map((_, i) => (
                    <button
                      key={i}
                      className={i === idx ? styles.dotActive : styles.dotBtn}
                      onClick={() => setIdx(i)}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.k}>Colors</span>
                  <span className={styles.v}>{normalizeColorList(active.colors).join(', ') || '-'}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.k}>Blouse Length</span>
                  <span className={styles.v}>{active.blouseLength || '-'}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.k}>Marketed By</span>
                  <span className={styles.v}>{active.marketedBy || '-'}</span>
                </div>

                <button className={styles.primaryWide} onClick={() => addToCart(active)}>
                  Add to cart
                </button>

                <p className={styles.hint}>
                  Tip: Use <b>←</b> and <b>→</b> to switch images, <b>Esc</b> to close.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

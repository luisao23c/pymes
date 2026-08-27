import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Event, Photo } from '../types';
import { FiArrowLeft, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const ease = [0.16, 1, 0.3, 1];

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lbIdx, setLbIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([api.events.getBySlug(slug), api.events.getPhotos(slug)])
      .then(([e, p]) => { setEvent(e); setPhotos(p); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const openLb = (i: number) => setLbIdx(i);
  const closeLb = () => setLbIdx(null);
  const prev = () => setLbIdx(i => i !== null && i > 0 ? i - 1 : photos.length - 1);
  const next = () => setLbIdx(i => i !== null && i < photos.length - 1 ? i + 1 : 0);

  useEffect(() => {
    if (lbIdx === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [lbIdx]);

  const waUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(`Hola, vi tu trabajo en ${event?.title || ''} y quiero un presupuesto`)}`;

  if (loading) return <div className="ld"><div className="ld__spinner" /></div>;
  if (!event) return <div className="nf"><h2>No encontrado</h2><Link to="/eventos">Volver</Link></div>;

  return (
    <div className="ed">
      {/* HERO */}
      <div className="ed__hero">
        {event.coverImage && (
          <div className="ed__hero-bg">
            <img src={event.coverImage} alt="" />
            <div className="ed__hero-ov" />
          </div>
        )}
        <div className="ed__hero-content">
          <Link to="/eventos" className="ed__back"><FiArrowLeft size={14} /> Volver</Link>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            <span className="ed__cat">{event.category}</span>
            <h1 className="ed__title">{event.title}</h1>
            <div className="ed__meta">
              <span>{new Date(event.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="ed__dot" />
              <span>{photos.length} fotos</span>
            </div>
            {event.description && <p className="ed__desc">{event.description}</p>}
          </motion.div>
        </div>
      </div>

      {/* GALLERY */}
      <div className="ed__gallery">
        <div className="ed__grid">
          {photos.map((p, i) => (
            <motion.div key={p._id} className="ed__cell"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
              onClick={() => openLb(i)}
            >
              <img src={p.thumbnailPath || p.compressedPath} alt="" loading="lazy" />
              <div className="ed__cell-ov">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  <path d="M11 8v6M8 11h6"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
        {!photos.length && <div className="ed__empty"><p>Próximamente</p></div>}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lbIdx !== null && (
          <motion.div className="lb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="lb__top">
              <span className="lb__num">{String(lbIdx + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
              <button onClick={closeLb}><FiX size={18} /></button>
            </div>
            <button className="lb__nav lb__prev" onClick={prev}><FiChevronLeft size={32} /></button>
            <div className="lb__center">
              <AnimatePresence mode="wait">
                <motion.img key={lbIdx}
                  src={photos[lbIdx].compressedPath || photos[lbIdx].originalPath}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease }}
                />
              </AnimatePresence>
            </div>
            <button className="lb__nav lb__next" onClick={next}><FiChevronRight size={32} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="ed__wa">
        <FaWhatsapp /> Pedir presupuesto
      </a>

      <style>{`
        .ed{}
        .ed__hero{position:relative;min-height:55vh;display:flex;align-items:flex-end;padding:8rem 3rem 4rem}
        .ed__hero-bg{position:absolute;inset:0}
        .ed__hero-bg img{width:100%;height:100%;object-fit:cover;filter:brightness(.2) saturate(.6)}
        .ed__hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,3,3,.2) 0%,rgba(3,3,3,.95) 90%)}
        .ed__hero-content{position:relative;z-index:10;max-width:1400px;margin:0 auto;width:100%}
        .ed__back{display:inline-flex;align-items:center;gap:.5rem;font-size:.65rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3);margin-bottom:2rem;transition:color .3s}
        .ed__back:hover{color:var(--ac)}
        .ed__cat{font-size:.55rem;text-transform:uppercase;letter-spacing:.25em;color:var(--ac);display:block;margin-bottom:.75rem}
        .ed__title{font-family:var(--d1);font-size:clamp(2.5rem,5vw,4rem);font-weight:300;margin-bottom:1rem}
        .ed__meta{display:flex;align-items:center;gap:.75rem;font-size:.8rem;color:var(--tx2);font-weight:300;margin-bottom:1.5rem}
        .ed__dot{width:3px;height:3px;border-radius:50%;background:var(--ac);opacity:.4}
        .ed__desc{max-width:550px;color:var(--tx2);font-weight:300;line-height:1.9;font-size:.9rem}

        .ed__gallery{max-width:1400px;margin:0 auto;padding:4rem 3rem 6rem}
        .ed__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.5rem}
        .ed__cell{position:relative;overflow:hidden;border-radius:2px;cursor:pointer;aspect-ratio:3/2}
        .ed__cell img{width:100%;height:100%;object-fit:cover;filter:brightness(.8);transition:all .7s var(--ease)}
        .ed__cell:hover img{transform:scale(1.04);filter:brightness(1)}
        .ed__cell-ov{position:absolute;inset:0;background:rgba(3,3,3,.25);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .4s}
        .ed__cell:hover .ed__cell-ov{opacity:1}

        .lb{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.97);display:flex;flex-direction:column}
        .lb__top{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem;z-index:10}
        .lb__num{font-size:.7rem;letter-spacing:.15em;color:var(--tx3)}
        .lb__top button{background:none;color:var(--tx2);padding:.5rem;transition:color .3s}
        .lb__top button:hover{color:var(--ac)}
        .lb__center{flex:1;display:flex;align-items:center;justify-content:center;padding:0 5rem}
        .lb__center img{max-width:100%;max-height:80vh;object-fit:contain}
        .lb__nav{position:absolute;top:50%;transform:translateY(-50%);background:none;color:var(--tx3);padding:1rem;z-index:10;transition:color .3s}
        .lb__nav:hover{color:var(--ac)}
        .lb__prev{left:.5rem}
        .lb__next{right:.5rem}

        .ed__wa{position:fixed;bottom:2rem;right:2rem;display:inline-flex;align-items:center;gap:.5rem;padding:.8rem 1.5rem;background:var(--ac);color:var(--bg);font-size:.7rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;z-index:50;transition:all .3s}
        .ed__wa:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,168,83,.25)}

        .nf{padding:12rem 2rem;text-align:center}
        .nf h2{font-family:var(--d1);font-weight:300;margin-bottom:1rem}
        .nf a{color:var(--ac);font-size:.8rem}

        .ld{display:flex;align-items:center;justify-content:center;height:100vh}
        .ld__spinner{width:28px;height:28px;border:1px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        .ed__empty{text-align:center;padding:6rem 0;color:var(--tx3)}

        @media(max-width:768px){.ed__grid{grid-template-columns:1fr 1fr;gap:3px}.ed__cell{aspect-ratio:1}.ed__hero{min-height:45vh;padding:7rem 1.5rem 3rem}.ed__gallery{padding:2rem 1rem 4rem}.lb__center{padding:0 3rem}}
        @media(max-width:480px){.ed__grid{grid-template-columns:1fr}.ed__cell{aspect-ratio:3/2}}
      `}</style>
    </div>
  );
}

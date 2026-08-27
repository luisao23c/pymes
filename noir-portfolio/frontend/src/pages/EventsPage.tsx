import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useInView } from '../hooks/useAnimations';
import { Event } from '../types';

const ease = [0.16, 1, 0.3, 1];
const CATS = [
  { value: '', label: 'Todos' },
  { value: 'bodas', label: 'Bodas' },
  { value: 'retratos', label: 'Retratos' },
  { value: 'paisajes', label: 'Paisajes' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'editorial', label: 'Editorial' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cat, setCat] = useState('');
  const [loading, setLoading] = useState(true);
  const { ref, isInView } = useInView(0.05);

  useEffect(() => {
    setLoading(true);
    const p: Record<string, string> = { limit: '50' };
    if (cat) p.category = cat;
    api.events.list(p).then(d => setEvents(d.events)).catch(() => {}).finally(() => setLoading(false));
  }, [cat]);

  return (
    <div className="ep">
      <div className="ep__hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <span className="ep__num">01</span>
          <h1 className="ep__title">Eventos</h1>
          <div className="ep__line" />
        </motion.div>
      </div>

      <div className="ep__container">
        <div className="ep__filters">
          {CATS.map(c => (
            <button key={c.value}
              className={`ep__filter ${cat === c.value ? 'ep__filter--active' : ''}`}
              onClick={() => setCat(c.value)}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="ep__grid" ref={ref}>
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="ep__skeleton-grid">
                {[1,2,3,4,5,6].map(i => <div key={i} className="ep__skel" />)}
              </div>
            ) : events.length === 0 ? (
              <div className="ep__empty"><p>Sin eventos</p></div>
            ) : (
              <motion.div className="ep__masonry" layout>
                {events.map((e, i) => (
                  <motion.div key={e._id}
                    className="ep__item"
                    initial={{ opacity: 0, y: 50, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.6, delay: i * 0.07, ease }}
                    layout
                  >
                    <Link to={`/eventos/${e.slug}`} className="ep__card">
                      <div className="ep__img">
                        {e.coverImage ? (
                          <img src={e.coverThumbnail || e.coverImage} alt="" loading="lazy" />
                        ) : <div className="ep__ph" />}
                        <div className="ep__overlay">
                          <span className="ep__cat">{e.category}</span>
                          <h3>{e.title}</h3>
                          <span className="ep__cnt">{e.photosCount} fotos</span>
                        </div>
                        <div className="ep__glow" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .ep{}
        .ep__hero{padding:10rem 3rem 4rem;background:linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%)}
        .ep__num{font-family:var(--d1);font-size:4rem;font-weight:300;font-style:italic;color:var(--ac);opacity:.15;display:block;line-height:1}
        .ep__title{font-family:var(--d1);font-size:clamp(3rem,6vw,5rem);font-weight:300;margin:.5rem 0}
        .ep__line{width:50px;height:1px;background:var(--ac)}

        .ep__container{max-width:1400px;margin:0 auto;padding:0 3rem 6rem}
        .ep__filters{display:flex;gap:0;margin-bottom:3rem;border-bottom:1px solid var(--bd);padding-bottom:1rem;flex-wrap:wrap}
        .ep__filter{padding:.5rem 1rem;background:none;color:var(--tx3);font-size:.65rem;text-transform:uppercase;letter-spacing:.15em;transition:all .3s;position:relative}
        .ep__filter:hover{color:var(--tx2)}
        .ep__filter--active{color:var(--ac)}
        .ep__filter--active::after{content:'';position:absolute;bottom:-1rem;left:50%;transform:translateX(-50%);width:20px;height:1px;background:var(--ac)}

        .ep__masonry{columns:3;column-gap:1.5rem}
        .ep__item{break-inside:avoid;margin-bottom:1.5rem}
        .ep__card{display:block;position:relative;overflow:hidden;border-radius:2px}
        .ep__img{position:relative}
        .ep__img img{width:100%;display:block;filter:brightness(.7) saturate(.8);transition:all .8s var(--ease)}
        .ep__card:hover .ep__img img{transform:scale(1.05);filter:brightness(.85) saturate(1)}
        .ep__ph{width:100%;aspect-ratio:3/4;background:linear-gradient(135deg,var(--bg3),var(--bg4))}

        .ep__overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(3,3,3,.85) 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;opacity:0;transform:translateY(10px);transition:all .5s var(--ease)}
        .ep__card:hover .ep__overlay{opacity:1;transform:translateY(0)}
        .ep__cat{font-size:.55rem;text-transform:uppercase;letter-spacing:.2em;color:var(--ac);margin-bottom:.3rem}
        .ep__overlay h3{font-family:var(--d1);font-size:1.2rem;font-weight:300;margin-bottom:.2rem}
        .ep__cnt{font-size:.65rem;color:var(--tx3)}

        .ep__glow{position:absolute;inset:0;opacity:0;transition:opacity .5s;box-shadow:inset 0 0 80px rgba(212,168,83,.06);pointer-events:none}
        .ep__card:hover .ep__glow{opacity:1}

        .ep__skeleton-grid{columns:3;column-gap:1.5rem;width:100%}
        .ep__skel{break-inside:avoid;margin-bottom:1.5rem;aspect-ratio:3/4;background:var(--bg3);animation:drift 3s ease-in-out infinite}

        .ep__empty{text-align:center;padding:6rem 0;color:var(--tx3)}

        @media(max-width:1024px){.ep__masonry,.ep__skeleton-grid{columns:2}}
        @media(max-width:640px){.ep__masonry,.ep__skeleton-grid{columns:1}.ep__hero{padding:8rem 1.5rem 3rem}.ep__container{padding:0 1.5rem 4rem}}
      `}</style>
    </div>
  );
}

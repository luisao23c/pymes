import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useTypewriter, useInView, useScramble, useCountUp } from '../hooks/useAnimations';
import { Event } from '../types';
import { FiArrowRight } from 'react-icons/fi';

const ease = [0.16, 1, 0.3, 1];

/* ─── HERO ─── */
function Hero() {
  const [featured, setFeatured] = useState<Event | null>(null);
  const { display, done } = useTypewriter('Noir', 120, 800);
  const { display: subDisplay } = useTypewriter('Fotografía con alma', 40, 2200);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    api.events.getFeatured().then(setFeatured).catch(() => {});
  }, []);

  return (
    <section className="hero">
      <div className="hero__bg">
        {featured?.coverImage && (
          <img src={featured.coverImage} alt=""
            className={`hero__img ${imgLoaded ? 'hero__img--loaded' : ''}`}
            onLoad={() => setImgLoaded(true)} />
        )}
        <div className="hero__grain" />
        <div className="hero__vignette" />
        <div className="hero__gradient" />
      </div>

      <div className="hero__content">
        <motion.div className="hero__line"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease }}
        />

        <div className="hero__title-wrap">
          <motion.h1 className="hero__title"
            initial={{ opacity: 0, y: 60, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            transition={{ duration: 1, delay: 0.5, ease }}
          >
            {display}
            <span className={`hero__cursor ${done ? 'blink' : ''}`}>|</span>
          </motion.h1>

          <motion.p className="hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4, ease }}
          >
            {subDisplay}
          </motion.p>
        </div>

        <motion.div className="hero__cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3, ease }}
        >
          <Link to="/eventos" className="btn-fill">
            <span>Explorar</span>
            <FiArrowRight />
          </Link>
        </motion.div>

        <motion.div className="hero__scroll"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <div className="hero__scroll-line" />
        </motion.div>
      </div>

      <style>{`
        .hero{position:relative;height:100vh;min-height:700px;display:flex;align-items:flex-end;overflow:hidden}
        .hero__bg{position:absolute;inset:0}
        .hero__img{width:100%;height:100%;object-fit:cover;filter:brightness(.2) saturate(.6);transform:scale(1.08);transition:all 2s var(--ease);opacity:0}
        .hero__img--loaded{opacity:1;transform:scale(1)}
        .hero__grain{position:absolute;inset:0;opacity:.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:grain 8s steps(10) infinite}
        .hero__vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(3,3,3,.85) 100%)}
        .hero__gradient{position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(to top,var(--bg),transparent)}

        .hero__content{position:relative;z-index:10;width:100%;max-width:1400px;margin:0 auto;padding:0 3rem 8rem}
        .hero__line{width:60px;height:1px;background:var(--ac);margin-bottom:2rem;transform-origin:left}

        .hero__title-wrap{margin-bottom:3rem}
        .hero__title{font-family:var(--d1);font-size:clamp(5rem,14vw,12rem);font-weight:300;line-height:.9;letter-spacing:-.02em;color:var(--tx)}
        .hero__cursor{color:var(--ac);font-weight:200;animation:blink .8s step-end infinite}
        .hero__cursor.blink{animation:blink .8s step-end infinite}
        .hero__sub{font-family:var(--d1);font-size:clamp(1rem,2.5vw,1.8rem);font-weight:300;font-style:italic;color:var(--tx3);margin-top:1rem;letter-spacing:.02em}

        .hero__cta{margin-bottom:0}
        .btn-fill{display:inline-flex;align-items:center;gap:.75rem;padding:.9rem 2.2rem;background:var(--ac);color:var(--bg);font-size:.65rem;font-weight:500;letter-spacing:.2em;text-transform:uppercase;transition:all .4s var(--ease)}
        .btn-fill:hover{background:var(--ac2);transform:translateY(-2px);box-shadow:0 10px 40px rgba(212,168,83,.2)}

        .hero__scroll{position:absolute;bottom:2rem;left:3rem}
        .hero__scroll-line{width:1px;height:50px;background:linear-gradient(to bottom,var(--ac),transparent);animation:pulse 2s ease-in-out infinite}

        @media(max-width:768px){
          .hero__content{padding:0 1.5rem 6rem}
          .hero__title{font-size:clamp(3.5rem,16vw,6rem)}
          .hero__scroll{left:1.5rem}
        }
      `}</style>
    </section>
  );
}

/* ─── EVENTS ─── */
function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const { ref, isInView } = useInView(0.05);

  useEffect(() => {
    api.events.list({ limit: '6' }).then(d => setEvents(d.events)).catch(() => {});
  }, []);

  if (!events.length) return null;

  return (
    <section className="ev" ref={ref}>
      <div className="ev__container">
        <motion.div className="ev__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <div className="ev__header-left">
            <span className="ev__num">01</span>
            <h2 className="ev__title">Trabajos Recientes</h2>
          </div>
          <Link to="/eventos" className="ev__all">Ver todos <FiArrowRight size={14} /></Link>
        </motion.div>

        <div className="ev__grid">
          {events.map((event, i) => (
            <motion.div key={event._id}
              className={`ev__item ev__item--${i % 3 === 0 ? 'tall' : 'normal'}`}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1, ease }}
            >
              <Link to={`/eventos/${event.slug}`} className="ev__card">
                <div className="ev__img-wrap">
                  {event.coverImage ? (
                    <img src={event.coverThumbnail || event.coverImage} alt="" loading="lazy" />
                  ) : <div className="ev__placeholder" />}
                  <div className="ev__shine" />
                </div>
                <div className="ev__info">
                  <span className="ev__cat">{event.category}</span>
                  <h3 className="ev__name">{event.title}</h3>
                  <span className="ev__count">{event.photosCount} fotos</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .ev{padding:8rem 3rem}
        .ev__container{max-width:1400px;margin:0 auto}

        .ev__header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:4rem;padding-bottom:1.5rem;border-bottom:1px solid var(--bd)}
        .ev__header-left{display:flex;align-items:baseline;gap:1.5rem}
        .ev__num{font-family:var(--d1);font-size:3rem;font-weight:300;font-style:italic;color:var(--ac);opacity:.25;line-height:1}
        .ev__title{font-family:var(--d1);font-size:2.2rem;font-weight:300}
        .ev__all{display:inline-flex;align-items:center;gap:.5rem;font-size:.65rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3);transition:color .3s}
        .ev__all:hover{color:var(--ac)}

        .ev__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        .ev__item--tall .ev__card{aspect-ratio:3/4}
        .ev__item--normal .ev__card{aspect-ratio:4/3}

        .ev__card{display:block;position:relative;overflow:hidden;border-radius:2px}
        .ev__img-wrap{position:relative;width:100%;height:100%}
        .ev__img-wrap img{width:100%;height:100%;object-fit:cover;filter:brightness(.7) saturate(.8);transition:all .8s var(--ease)}
        .ev__card:hover .ev__img-wrap img{transform:scale(1.06);filter:brightness(.85) saturate(1)}
        .ev__placeholder{width:100%;height:100%;background:linear-gradient(135deg,var(--bg3),var(--bg4))}

        .ev__shine{position:absolute;inset:0;background:linear-gradient(135deg,transparent 30%,rgba(212,168,83,.04) 100%);opacity:0;transition:opacity .5s}
        .ev__card:hover .ev__shine{opacity:1}

        .ev__info{position:absolute;bottom:0;left:0;right:0;padding:2rem 1.5rem 1.5rem;background:linear-gradient(180deg,transparent,rgba(3,3,3,.8));opacity:0;transform:translateY(10px);transition:all .5s var(--ease)}
        .ev__card:hover .ev__info{opacity:1;transform:translateY(0)}
        .ev__cat{font-size:.55rem;text-transform:uppercase;letter-spacing:.2em;color:var(--ac);display:block;margin-bottom:.3rem}
        .ev__name{font-family:var(--d1);font-size:1.2rem;font-weight:300}
        .ev__count{font-size:.65rem;color:var(--tx3)}

        @media(max-width:1024px){.ev__grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:640px){.ev{padding:4rem 1.5rem}.ev__grid{grid-template-columns:1fr;gap:2rem}.ev__header{flex-direction:column;align-items:flex-start;gap:.5rem}}
      `}</style>
    </section>
  );
}

/* ─── STATS ─── */
function Stats() {
  const { ref, isInView } = useInView(0.2);
  const evCount = useCountUp(150, 2000, isInView);
  const photoCount = useCountUp(10000, 2000, isInView);
  const yearCount = useCountUp(8, 1500, isInView);

  return (
    <section className="st" ref={ref}>
      <div className="st__inner">
        <motion.div className="st__text"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <span className="ev__num">02</span>
          <h2 className="st__title">Sobre Mí</h2>
          <div className="st__line" />
          <p className="st__desc">
            Mi enfoque combina la técnica clásica con una mirada contemporánea,
            buscando la luz perfecta en cada escena. Cada fotografía es una ventana
            a una emoción capturada en el tiempo.
          </p>
          <Link to="/contacto" className="st__link">Trabajemos juntos <FiArrowRight size={14} /></Link>
        </motion.div>

        <motion.div className="st__numbers"
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div className="st__stat">
            <span className="st__val">{evCount}+</span>
            <span className="st__label">Eventos</span>
          </div>
          <div className="st__sep" />
          <div className="st__stat">
            <span className="st__val">{(photoCount / 1000).toFixed(0)}K+</span>
            <span className="st__label">Fotos</span>
          </div>
          <div className="st__sep" />
          <div className="st__stat">
            <span className="st__val">{yearCount}</span>
            <span className="st__label">Años</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .st{padding:8rem 3rem;background:var(--bg2)}
        .st__inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:6rem;align-items:center}
        .st__title{font-family:var(--d1);font-size:3rem;font-weight:300;margin:.75rem 0 .5rem}
        .st__line{width:50px;height:1px;background:var(--ac);margin-bottom:2rem}
        .st__desc{color:var(--tx2);font-weight:300;line-height:2;font-size:.9rem;margin-bottom:2rem}
        .st__link{display:inline-flex;align-items:center;gap:.5rem;font-size:.65rem;text-transform:uppercase;letter-spacing:.15em;color:var(--ac);transition:gap .3s}
        .st__link:hover{gap:.75rem}

        .st__numbers{display:flex;justify-content:center;align-items:center;gap:3rem}
        .st__stat{text-align:center}
        .st__val{display:block;font-family:var(--d1);font-size:4.5rem;font-weight:300;color:var(--ac);line-height:1}
        .st__label{display:block;margin-top:.5rem;font-size:.6rem;text-transform:uppercase;letter-spacing:.2em;color:var(--tx3)}
        .st__sep{width:1px;height:50px;background:var(--bd)}

        @media(max-width:768px){.st{padding:4rem 1.5rem}.st__inner{grid-template-columns:1fr;gap:3rem}.st__numbers{gap:2rem}.st__val{font-size:3rem}}
      `}</style>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  const { ref, isInView } = useInView(0.2);
  const scrambled = useScramble('Hablemos de tu proyecto', isInView);

  return (
    <section className="cta" ref={ref}>
      <motion.div className="cta__inner"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <span className="cta__label">¿Listo?</span>
        <h2 className="cta__title">{scrambled}</h2>
        <Link to="/contacto" className="btn-fill"><span>Contactar</span><FiArrowRight /></Link>
      </motion.div>
      <style>{`
        .cta{padding:10rem 3rem;text-align:center;background:radial-gradient(ellipse at 50% 50%,var(--bg3),var(--bg))}
        .cta__inner{max-width:600px;margin:0 auto}
        .cta__label{font-size:.6rem;text-transform:uppercase;letter-spacing:.3em;color:var(--ac);display:block;margin-bottom:1rem}
        .cta__title{font-family:var(--d1);font-size:clamp(2rem,4vw,3.5rem);font-weight:300;line-height:1.3;margin-bottom:2.5rem}
        @media(max-width:768px){.cta{padding:5rem 1.5rem}}
      `}</style>
    </section>
  );
}

export default function HomePage() {
  return <><Hero /><Events /><Stats /><CTA /></>;
}

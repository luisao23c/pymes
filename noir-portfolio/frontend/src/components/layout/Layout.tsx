import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [entered, setEntered] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const navItems = [
    { to: '/', label: 'Inicio' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/contacto', label: 'Contacto' },
  ];

  return (
    <div className="layout">
      {/* PRELOADER */}
      <AnimatePresence>
        {!entered && (
          <motion.div className="preloader"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          >
            <motion.span className="preloader-mark"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >N</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className={`hdr ${scrolled ? 'hdr--solid' : ''} ${isHome ? '' : 'hdr--solid'}`}>
        <div className="hdr__inner">
          <Link to="/" className="hdr__logo">
            <span className="hdr__mark">N</span>
          </Link>

          <nav className="hdr__nav">
            {navItems.map((n) => (
              <Link key={n.to} to={n.to}
                className={`hdr__link ${location.pathname === n.to ? 'hdr__link--active' : ''}`}
              >
                <span className="hdr__link-text">{n.label}</span>
              </Link>
            ))}
          </nav>

          <button className="hdr__burger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`burger ${menuOpen ? 'burger--open' : ''}`}>
              <span /><span />
            </span>
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 2rem) 2.5rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2rem) 2.5rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2rem) 2.5rem)' }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          >
            <div className="mobile-menu__inner">
              {navItems.map((n, i) => (
                <motion.div key={n.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16,1,0.3,1] }}
                >
                  <Link to={n.to} className="mobile-link"
                    onClick={() => setMenuOpen(false)}>
                    <span className="mobile-link__num">0{i + 1}</span>
                    <span className="mobile-link__text">{n.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main><Outlet /></main>

      {/* WHATSAPP */}
      <a href="https://wa.me/5491112345678?text=Hola,%20vi%20tu%20trabajo%20y%20quiero%20un%20presupuesto"
        target="_blank" rel="noopener noreferrer" className="wa">
        <FaWhatsapp />
      </a>

      {/* FOOTER */}
      <footer className="ftr">
        <div className="ftr__inner">
          <div className="ftr__top">
            <div className="ftr__brand">
              <span className="ftr__mark">N</span>
              <p className="ftr__tag">Capturando la esencia<br />de cada instante</p>
            </div>
            <div className="ftr__links">
              {navItems.map(n => <Link key={n.to} to={n.to}>{n.label}</Link>)}
            </div>
          </div>
          <div className="ftr__sep" />
          <p className="ftr__copy">&copy; 2024 Noir Photography</p>
        </div>
      </footer>

      <style>{`
        .layout{min-height:100vh;display:flex;flex-direction:column}

        .preloader{position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;align-items:center;justify-content:center}
        .preloader-mark{font-family:var(--d1);font-size:10rem;font-weight:300;font-style:italic;color:var(--ac)}

        .hdr{position:fixed;top:0;left:0;right:0;z-index:100;padding:2rem 3rem;transition:all .5s var(--ease)}
        .hdr--solid{background:rgba(3,3,3,.88);backdrop-filter:blur(24px) saturate(1.3);padding:1.2rem 3rem;border-bottom:1px solid var(--bd)}
        .hdr__inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}

        .hdr__logo{display:flex;align-items:center}
        .hdr__mark{font-family:var(--d1);font-size:2rem;font-weight:300;font-style:italic;color:var(--ac);transition:transform .4s var(--ease)}
        .hdr__logo:hover .hdr__mark{transform:scale(1.1) rotate(-3deg)}

        .hdr__nav{display:flex;gap:2.5rem}
        .hdr__link{font-size:.65rem;font-weight:400;letter-spacing:.2em;text-transform:uppercase;color:var(--tx3);transition:color .3s;position:relative;padding:.25rem 0}
        .hdr__link::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:var(--ac);transition:width .5s var(--ease)}
        .hdr__link:hover,.hdr__link--active{color:var(--tx)}
        .hdr__link:hover::after,.hdr__link--active::after{width:100%}

        .hdr__burger{display:none;background:none;padding:.5rem}
        .burger{display:flex;flex-direction:column;gap:5px;width:20px}
        .burger span{display:block;width:100%;height:1px;background:var(--tx);transition:all .3s var(--ease);transform-origin:center}
        .burger--open span:first-child{transform:translateY(3px) rotate(45deg)}
        .burger--open span:last-child{transform:translateY(-3px) rotate(-45deg)}

        .mobile-menu{position:fixed;inset:0;z-index:200;background:var(--bg);display:flex;align-items:center;justify-content:center}
        .mobile-menu__inner{display:flex;flex-direction:column;gap:1rem}
        .mobile-link{display:flex;align-items:baseline;gap:1.5rem;text-decoration:none}
        .mobile-link__num{font-size:.6rem;color:var(--tx3);letter-spacing:.1em}
        .mobile-link__text{font-family:var(--d1);font-size:clamp(3rem,8vw,5rem);font-weight:300;color:var(--tx2);transition:color .3s}
        .mobile-link:hover .mobile-link__text{color:var(--ac)}

        main{flex:1}

        .wa{position:fixed;bottom:2rem;right:2rem;width:52px;height:52px;background:var(--ac);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--bg);font-size:1.3rem;z-index:90;transition:all .4s var(--ease);box-shadow:0 4px 30px rgba(212,168,83,.2)}
        .wa:hover{transform:scale(1.12) translateY(-3px);box-shadow:0 8px 40px rgba(212,168,83,.35)}

        .ftr{padding:4rem 3rem 2rem;background:var(--bg2);border-top:1px solid var(--bd)}
        .ftr__inner{max-width:1400px;margin:0 auto}
        .ftr__top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem}
        .ftr__mark{font-family:var(--d1);font-size:2.5rem;font-weight:300;font-style:italic;color:var(--ac);opacity:.4}
        .ftr__tag{font-family:var(--d1);font-size:.9rem;font-style:italic;color:var(--tx3);margin-top:.5rem;line-height:1.6}
        .ftr__links{display:flex;gap:2rem}
        .ftr__links a{font-size:.65rem;text-transform:uppercase;letter-spacing:.2em;color:var(--tx3);transition:color .3s}
        .ftr__links a:hover{color:var(--ac)}
        .ftr__sep{height:1px;background:linear-gradient(90deg,var(--ac) 0%,transparent 60%);margin-bottom:1.5rem;opacity:.2}
        .ftr__copy{font-size:.65rem;color:var(--tx3);letter-spacing:.05em}

        @media(max-width:768px){
          .hdr{padding:1.2rem 1.5rem}
          .hdr--solid{padding:1rem 1.5rem}
          .hdr__nav{display:none}
          .hdr__burger{display:block}
          .ftr{padding:3rem 1.5rem 1.5rem}
          .ftr__top{flex-direction:column;gap:1.5rem}
        }
      `}</style>
    </div>
  );
}

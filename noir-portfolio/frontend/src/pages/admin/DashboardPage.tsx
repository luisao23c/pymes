import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { FiImage, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const ease = [0.16, 1, 0.3, 1];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.dashboard.stats().then(setStats).catch(() => {}); }, []);

  const cards = [
    { label: 'Eventos', val: stats?.totalEvents || 0, icon: <FiCalendar size={18} />, c: 'var(--ac)' },
    { label: 'Fotos', val: stats?.totalPhotos || 0, icon: <FiImage size={18} />, c: 'var(--grn)' },
    { label: 'Sin leer', val: stats?.unreadMessages || 0, icon: <FiMessageSquare size={18} />, c: 'var(--red)' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <span className="db__label">Dashboard</span>
        <h1 className="db__title">Bienvenido</h1>
        <div className="db__line" />
      </motion.div>
      <div className="db__grid">
        {cards.map((c, i) => (
          <motion.div key={c.label} className="db__card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease }}>
            <div className="db__icon" style={{ color: c.c }}>{c.icon}</div>
            <div className="db__val">{c.val}</div>
            <div className="db__clabel">{c.label}</div>
            <div className="db__glow" style={{ background: c.c }} />
          </motion.div>
        ))}
      </div>
      <style>{`
        .db__label{font-size:.55rem;text-transform:uppercase;letter-spacing:.2em;color:var(--tx3)}
        .db__title{font-family:var(--d1);font-size:2rem;font-weight:300;margin:.5rem 0 1.5rem}
        .db__line{width:35px;height:1px;background:var(--ac)}
        .db__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.25rem;margin-top:2rem}
        .db__card{background:var(--bg2);border:1px solid var(--bd);padding:1.75rem;position:relative;overflow:hidden;transition:border-color .3s}
        .db__card:hover{border-color:var(--bd2)}
        .db__icon{margin-bottom:1.25rem}
        .db__val{font-family:var(--d1);font-size:3rem;font-weight:300;line-height:1;margin-bottom:.3rem}
        .db__clabel{font-size:.65rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3)}
        .db__glow{position:absolute;top:0;right:0;width:60px;height:60px;border-radius:50%;filter:blur(50px);opacity:.05}
      `}</style>
    </div>
  );
}

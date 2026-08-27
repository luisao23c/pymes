import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiImage, FiMessageSquare, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const links = [
    { to: '/admin', icon: <FiHome size={15} />, label: 'Dashboard', exact: true },
    { to: '/admin/eventos', icon: <FiImage size={15} />, label: 'Eventos' },
    { to: '/admin/mensajes', icon: <FiMessageSquare size={15} />, label: 'Mensajes' },
  ];

  const isActive = (p: string, ex?: boolean) => ex ? location.pathname === p : location.pathname.startsWith(p);

  return (
    <div className="al">
      <button className="al__burger" onClick={() => setOpen(!open)}>
        {open ? <FiX size={16} /> : <FiMenu size={16} />}
      </button>

      <aside className={`al__side ${open ? 'al__side--open' : ''}`}>
        <div className="al__brand">
          <span className="al__mark">N</span>
          <span className="al__badge">Admin</span>
        </div>
        <nav className="al__nav">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`al__link ${isActive(l.to, l.exact) ? 'al__link--on' : ''}`}
              onClick={() => setOpen(false)}>
              {l.icon}<span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="al__foot">
          <div className="al__user">
            <div className="al__avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div><span className="al__uname">{user?.username}</span><span className="al__role">{user?.role}</span></div>
          </div>
          <button onClick={handleLogout} className="al__out"><FiLogOut size={13} /></button>
        </div>
      </aside>

      <main className="al__main"><Outlet /></main>

      <style>{`
        .al{display:flex;min-height:100vh}
        .al__side{width:230px;background:var(--bg2);border-right:1px solid var(--bd);display:flex;flex-direction:column;position:fixed;top:0;bottom:0;z-index:100}
        .al__brand{padding:1.5rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid var(--bd)}
        .al__mark{font-family:var(--d1);font-size:1.5rem;font-weight:300;font-style:italic;color:var(--ac)}
        .al__badge{font-size:.5rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3);padding:.15rem .4rem;border:1px solid var(--bd)}
        .al__nav{flex:1;padding:.75rem 0}
        .al__link{display:flex;align-items:center;gap:.75rem;padding:.65rem 1.5rem;color:var(--tx3);font-size:.75rem;transition:all .2s;border-left:2px solid transparent}
        .al__link:hover{color:var(--tx);background:var(--bg3)}
        .al__link--on{color:var(--ac);background:var(--ac-dim);border-left-color:var(--ac)}
        .al__foot{padding:1rem 1.5rem;border-top:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between}
        .al__user{display:flex;align-items:center;gap:.6rem}
        .al__avatar{width:28px;height:28px;border-radius:50%;background:var(--ac-dim);color:var(--ac);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:500}
        .al__uname{display:block;font-size:.75rem}
        .al__role{display:block;font-size:.55rem;color:var(--tx3);text-transform:capitalize}
        .al__out{background:none;color:var(--tx3);padding:.35rem;transition:color .2s}
        .al__out:hover{color:var(--red)}
        .al__main{flex:1;margin-left:230px;padding:2rem}
        .al__burger{display:none;position:fixed;top:1rem;left:1rem;z-index:200;background:var(--bg3);color:var(--tx);padding:.4rem;border:1px solid var(--bd)}
        @media(max-width:768px){.al__side{transform:translateX(-100%);transition:transform .3s var(--ease)}.al__side--open{transform:translateX(0)}.al__main{margin-left:0;padding:1rem;padding-top:4rem}.al__burger{display:flex}}
      `}</style>
    </div>
  );
}

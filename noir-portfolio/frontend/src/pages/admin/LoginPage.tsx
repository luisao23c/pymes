import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password); toast.success('Bienvenido'); navigate('/admin'); }
    catch { toast.error('Credenciales incorrectas'); } finally { setLoading(false); }
  };

  return (
    <div className="lp">
      <div className="lp__left">
        <div className="lp__art">
          <motion.span className="lp__mark"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease }}
          >N</motion.span>
          <motion.div className="lp__circle"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease }}
          />
          <div className="lp__lines">
            {[1,2,3,4,5].map(i => (
              <motion.div key={i} className="lp__line"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="lp__right">
        <motion.div className="lp__card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="lp__label">Administración</span>
          <h1 className="lp__title">Iniciar Sesión</h1>
          <div className="lp__sep" />

          <form onSubmit={handleSubmit}>
            <div className={`lp__field ${focused === 'email' || email ? 'lp__field--on' : ''}`}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} required />
              <div className="lp__uline" />
            </div>
            <div className={`lp__field ${focused === 'password' || password ? 'lp__field--on' : ''}`}>
              <label>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required />
              <div className="lp__uline" />
            </div>
            <button type="submit" className="lp__btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </motion.div>
      </div>

      <style>{`
        .lp{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
        .lp__left{background:var(--bg2);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;border-right:1px solid var(--bd)}
        .lp__art{position:relative;z-index:2}
        .lp__mark{font-family:var(--d1);font-size:12rem;font-weight:300;font-style:italic;color:var(--ac);display:block;line-height:1;opacity:.8}
        .lp__circle{position:absolute;top:50%;left:50%;width:250px;height:250px;border:1px solid var(--bd);border-radius:50%;transform:translate(-50%,-50%);opacity:.2}
        .lp__lines{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;opacity:.1}
        .lp__line{position:absolute;left:0;right:0;height:1px;background:var(--ac);transform-origin:left}

        .lp__right{display:flex;align-items:center;justify-content:center;padding:2rem}
        .lp__card{width:100%;max-width:360px}
        .lp__label{font-size:.55rem;text-transform:uppercase;letter-spacing:.2em;color:var(--tx3)}
        .lp__title{font-family:var(--d1);font-size:2.5rem;font-weight:300;margin:.5rem 0}
        .lp__sep{width:35px;height:1px;background:var(--ac);margin-bottom:2.5rem}

        .lp__field{margin-bottom:1.5rem;position:relative}
        .lp__field label{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3);margin-bottom:.5rem;transition:color .3s}
        .lp__field--on label{color:var(--ac)}
        .lp__field input{width:100%;background:none;border:none;border-bottom:1px solid var(--bd);color:var(--tx);padding:.5rem 0;font-size:.85rem;font-weight:300;outline:none;transition:border-color .3s}
        .lp__field input:focus{border-color:var(--ac)}
        .lp__uline{position:absolute;bottom:0;left:0;width:0;height:1px;background:var(--ac);transition:width .5s var(--ease)}
        .lp__field--on .lp__uline{width:100%}

        .lp__btn{width:100%;padding:1rem;background:var(--ac);color:var(--bg);font-size:.65rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;border:1px solid var(--ac);transition:all .4s var(--ease);margin-top:1rem}
        .lp__btn:hover:not(:disabled){background:transparent;color:var(--ac)}
        .lp__btn:disabled{opacity:.5;cursor:not-allowed}

        @media(max-width:768px){.lp{grid-template-columns:1fr}.lp__left{display:none}}
      `}</style>
    </div>
  );
}

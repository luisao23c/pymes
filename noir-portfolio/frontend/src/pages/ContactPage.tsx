import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { FiSend, FiPhone, FiMail, FiMapPin, FiInstagram } from 'react-icons/fi';

const ease = [0.16, 1, 0.3, 1];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Campos obligatorios'); return; }
    setLoading(true);
    try { await api.messages.send(form); toast.success('Mensaje enviado'); setForm({ name: '', email: '', phone: '', message: '' }); }
    catch { toast.error('Error'); } finally { setLoading(false); }
  };

  return (
    <div className="cp">
      <div className="cp__hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <span className="cp__num">03</span>
          <h1 className="cp__title">Contacto</h1>
          <div className="cp__line" />
        </motion.div>
      </div>

      <div className="cp__grid">
        <motion.div className="cp__left"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <h2 className="cp__h2">Hablemos</h2>
          <p className="cp__text">Cada gran proyecto comienza con una conversación. Cuéntame tu idea y hagamos que cobre vida.</p>

          <div className="cp__items">
            {[
              { icon: <FiPhone />, label: 'Teléfono', val: '+54 9 11 1234-5678' },
              { icon: <FiMail />, label: 'Email', val: 'hola@noirphoto.com' },
              { icon: <FiMapPin />, label: 'Ubicación', val: 'Buenos Aires, Argentina' },
            ].map((it, i) => (
              <motion.div key={i} className="cp__item"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease }}>
                <div className="cp__icon">{it.icon}</div>
                <div><span className="cp__ilabel">{it.label}</span><span className="cp__ival">{it.val}</span></div>
              </motion.div>
            ))}
          </div>

          <a href="#" className="cp__ig"><FiInstagram /> @noir.photo</a>
        </motion.div>

        <motion.form className="cp__form" onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
        >
          {[
            { id: 'name', label: 'Nombre *', type: 'text', val: form.name, set: (v: string) => setForm({ ...form, name: v }) },
            { id: 'email', label: 'Email *', type: 'email', val: form.email, set: (v: string) => setForm({ ...form, email: v }) },
            { id: 'phone', label: 'Teléfono', type: 'tel', val: form.phone, set: (v: string) => setForm({ ...form, phone: v }) },
          ].map(f => (
            <div key={f.id} className={`cp__field ${focused === f.id || f.val ? 'cp__field--active' : ''}`}>
              <label htmlFor={f.id}>{f.label}</label>
              <input id={f.id} type={f.type} value={f.val}
                onChange={e => f.set(e.target.value)}
                onFocus={() => setFocused(f.id)} onBlur={() => setFocused('')} />
              <div className="cp__underline" />
            </div>
          ))}
          <div className={`cp__field cp__field--area ${focused === 'message' || form.message ? 'cp__field--active' : ''}`}>
            <label htmlFor="message">Mensaje *</label>
            <textarea id="message" value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
              rows={5} />
            <div className="cp__underline" />
          </div>
          <button type="submit" className="cp__submit" disabled={loading}>
            {loading ? 'Enviando...' : <><span>Enviar</span><FiSend size={14} /></>}
          </button>
        </motion.form>
      </div>

      <style>{`
        .cp{}
        .cp__hero{padding:10rem 3rem 4rem;background:linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%)}
        .cp__num{font-family:var(--d1);font-size:4rem;font-weight:300;font-style:italic;color:var(--ac);opacity:.15;display:block;line-height:1}
        .cp__title{font-family:var(--d1);font-size:clamp(3rem,6vw,5rem);font-weight:300;margin:.5rem 0}
        .cp__line{width:50px;height:1px;background:var(--ac)}

        .cp__grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:6rem;padding:4rem 3rem 6rem}

        .cp__h2{font-family:var(--d1);font-size:2rem;font-weight:300;margin-bottom:1rem}
        .cp__text{color:var(--tx2);font-weight:300;line-height:1.9;margin-bottom:2.5rem;font-size:.9rem}
        .cp__items{display:flex;flex-direction:column;gap:1.25rem;margin-bottom:2.5rem}
        .cp__item{display:flex;align-items:flex-start;gap:1rem}
        .cp__icon{width:36px;height:36px;border-radius:50%;border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;color:var(--ac);flex-shrink:0;transition:all .3s;font-size:.85rem}
        .cp__item:hover .cp__icon{border-color:var(--ac);background:var(--ac-dim)}
        .cp__ilabel{display:block;font-size:.55rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3);margin-bottom:.1rem}
        .cp__ival{color:var(--tx);font-weight:300;font-size:.85rem}
        .cp__ig{display:inline-flex;align-items:center;gap:.5rem;font-size:.8rem;color:var(--tx2);padding-top:2rem;border-top:1px solid var(--bd);transition:color .3s}
        .cp__ig:hover{color:var(--ac)}

        .cp__form{display:flex;flex-direction:column;gap:1.5rem}
        .cp__field{position:relative}
        .cp__field label{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:var(--tx3);margin-bottom:.5rem;transition:color .3s}
        .cp__field--active label{color:var(--ac)}
        .cp__field input,.cp__field textarea{width:100%;background:none;border:none;border-bottom:1px solid var(--bd);color:var(--tx);padding:.5rem 0;font-size:.85rem;font-weight:300;outline:none;transition:border-color .3s;resize:none}
        .cp__field input:focus,.cp__field textarea:focus{border-color:var(--ac)}
        .cp__underline{position:absolute;bottom:0;left:0;width:0;height:1px;background:var(--ac);transition:width .5s var(--ease)}
        .cp__field--active .cp__underline{width:100%}
        .cp__field--area{min-height:120px}

        .cp__submit{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:var(--ac);color:var(--bg);font-size:.65rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;border:1px solid var(--ac);transition:all .4s var(--ease);align-self:flex-start}
        .cp__submit:hover:not(:disabled){background:transparent;color:var(--ac)}
        .cp__submit:disabled{opacity:.5;cursor:not-allowed}

        @media(max-width:768px){.cp__grid{grid-template-columns:1fr;gap:3rem;padding:2rem 1.5rem 4rem}.cp__hero{padding:8rem 1.5rem 3rem}}
      `}</style>
    </div>
  );
}

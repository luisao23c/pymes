import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Message } from '../../types';
import toast from 'react-hot-toast';
import { FiEye, FiCheck, FiTrash2, FiFilter } from 'react-icons/fi';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, responded: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  const loadMessages = () => {
    const params: Record<string, string> = { limit: '50' };
    if (filter) params.status = filter;
    api.messages.list(params)
      .then((data) => {
        setMessages(data.messages);
        setStats(data);
      })
      .catch(() => toast.error('Error al cargar mensajes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, [filter]);

  const markAs = async (id: string, status: string) => {
    try {
      await api.messages.updateStatus(id, status);
      loadMessages();
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.messages.delete(id);
      toast.success('Mensaje eliminado');
      setSelectedMsg(null);
      loadMessages();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const statusColors: Record<string, string> = {
    unread: '#e74c3c',
    read: '#f39c12',
    responded: '#27ae60',
  };

  return (
    <div className="admin-messages">
      <div className="admin-page-header">
        <div>
          <h1>Mensajes</h1>
          <p className="admin-page-subtitle">
            {stats.unread} sin leer · {stats.read} leídos · {stats.responded} respondidos
          </p>
        </div>
        <div className="filter-group">
          <FiFilter />
          {['', 'unread', 'read', 'responded'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : messages.length === 0 ? (
        <div className="empty">No hay mensajes</div>
      ) : (
        <div className="messages-list">
          {messages.map((msg, i) => (
            <motion.div
              key={msg._id}
              className={`message-card ${msg.status} ${selectedMsg?._id === msg._id ? 'selected' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedMsg(selectedMsg?._id === msg._id ? null : msg)}
            >
              <div className="message-header">
                <div className="message-status-dot" style={{ background: statusColors[msg.status] }} />
                <span className="message-name">{msg.name}</span>
                <span className="message-email">{msg.email}</span>
                <span className="message-date">{new Date(msg.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <p className="message-preview">{msg.message.slice(0, 120)}...</p>
              {selectedMsg?._id === msg._id && (
                <div className="message-detail">
                  <p className="message-full">{msg.message}</p>
                  {msg.phone && <p className="message-phone">Tel: {msg.phone}</p>}
                  {msg.eventSlug && <p className="message-event">Evento: {msg.eventSlug}</p>}
                  <div className="message-actions">
                    {msg.status === 'unread' && (
                      <button onClick={(e) => { e.stopPropagation(); markAs(msg._id, 'read'); }}>
                        <FiEye /> Marcar leído
                      </button>
                    )}
                    {msg.status !== 'responded' && (
                      <button onClick={(e) => { e.stopPropagation(); markAs(msg._id, 'responded'); }}>
                        <FiCheck /> Marcar respondido
                      </button>
                    )}
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}>
                      <FiTrash2 /> Eliminar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        .admin-messages {}
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .admin-page-header h1 { font-size: 1.8rem; font-weight: 200; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .admin-page-subtitle { color: var(--text-secondary); font-size: 0.85rem; font-weight: 300; }
        .filter-group { display: flex; align-items: center; gap: 0.5rem; }
        .filter-group svg { color: var(--text-muted); }
        .filter-btn { padding: 0.4rem 0.8rem; background: transparent; border: 1px solid var(--border); color: var(--text-secondary); font-size: 0.75rem; text-transform: capitalize; border-radius: 2px; transition: all 0.2s; }
        .filter-btn:hover { border-color: var(--accent); }
        .filter-btn.active { background: var(--accent); color: var(--bg-primary); border-color: var(--accent); }
        .messages-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .message-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; padding: 1rem 1.25rem; cursor: pointer; transition: all 0.2s; }
        .message-card:hover { border-color: var(--border-light); }
        .message-card.selected { border-color: var(--accent); }
        .message-card.unread { border-left: 3px solid #e74c3c; }
        .message-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
        .message-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .message-name { font-weight: 500; font-size: 0.9rem; }
        .message-email { color: var(--text-secondary); font-size: 0.8rem; }
        .message-date { color: var(--text-muted); font-size: 0.75rem; margin-left: auto; }
        .message-preview { color: var(--text-secondary); font-size: 0.85rem; font-weight: 300; }
        .message-detail { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
        .message-full { color: var(--text-primary); font-weight: 300; line-height: 1.7; margin-bottom: 0.75rem; }
        .message-phone, .message-event { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
        .message-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
        .message-actions button { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.4rem 0.8rem; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); font-size: 0.75rem; border-radius: 2px; transition: all 0.2s; }
        .message-actions button:hover { border-color: var(--accent); color: var(--accent); }
        .message-actions .delete-btn:hover { border-color: var(--danger); color: var(--danger); }
        .loading, .empty { padding: 3rem; text-align: center; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}

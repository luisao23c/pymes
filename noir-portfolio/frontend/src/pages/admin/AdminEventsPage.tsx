import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Event } from '../../types';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = () => {
    api.events.list({ limit: '100' })
      .then((data) => setEvents(data.events))
      .catch(() => toast.error('Error al cargar eventos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.events.delete(id);
      toast.success('Evento eliminado');
      loadEvents();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="admin-events">
      <div className="admin-page-header">
        <div>
          <h1>Eventos</h1>
          <p className="admin-page-subtitle">{events.length} eventos totales</p>
        </div>
        <Link to="/admin/eventos/nuevo" className="btn-primary">
          <FiPlus /> Nuevo evento
        </Link>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : events.length === 0 ? (
        <div className="empty">
          <p>No hay eventos creados</p>
          <Link to="/admin/eventos/nuevo" className="btn-primary">Crear primer evento</Link>
        </div>
      ) : (
        <div className="events-table">
          <div className="table-header">
            <span className="col-event">Evento</span>
            <span className="col-category">Categoría</span>
            <span className="col-date">Fecha</span>
            <span className="col-photos">Fotos</span>
            <span className="col-actions">Acciones</span>
          </div>
          {events.map((event, i) => (
            <motion.div
              key={event._id}
              className="table-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="col-event">
                <div className="event-thumb">
                  {event.coverImage ? <img src={event.coverThumbnail || event.coverImage} alt="" /> : <FiImage />}
                </div>
                <div>
                  <span className="event-name">{event.title}</span>
                  {event.featured && <span className="featured-badge">Destacado</span>}
                </div>
              </div>
              <span className="col-category">{event.category}</span>
              <span className="col-date">{new Date(event.date).toLocaleDateString('es-ES')}</span>
              <span className="col-photos">{event.photosCount}</span>
              <div className="col-actions">
                <Link to={`/admin/eventos/${event._id}/editar`} className="action-btn edit"><FiEdit2 /></Link>
                <button onClick={() => handleDelete(event._id, event.title)} className="action-btn delete"><FiTrash2 /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        .admin-events {}
        .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .admin-page-header h1 { font-size: 1.8rem; font-weight: 200; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .admin-page-subtitle { color: var(--text-secondary); font-size: 0.85rem; font-weight: 300; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.2rem; background: var(--accent); color: var(--bg-primary); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 2px; transition: opacity 0.3s; }
        .btn-primary:hover { opacity: 0.9; }
        .events-table { border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 80px 100px; padding: 0.75rem 1rem; background: var(--bg-secondary); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 80px 100px; padding: 0.75rem 1rem; border-top: 1px solid var(--border); align-items: center; transition: background 0.2s; }
        .table-row:hover { background: var(--bg-hover); }
        .col-event { display: flex; align-items: center; gap: 0.75rem; }
        .event-thumb { width: 40px; height: 40px; border-radius: 4px; overflow: hidden; background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0; }
        .event-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .event-name { font-weight: 400; font-size: 0.9rem; }
        .featured-badge { display: inline-block; font-size: 0.6rem; background: var(--accent-dim); color: var(--accent); padding: 0.1rem 0.4rem; border-radius: 2px; margin-left: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .col-category { font-size: 0.8rem; color: var(--text-secondary); text-transform: capitalize; }
        .col-date { font-size: 0.8rem; color: var(--text-secondary); }
        .col-photos { font-size: 0.8rem; color: var(--text-secondary); text-align: center; }
        .col-actions { display: flex; gap: 0.5rem; }
        .action-btn { background: none; padding: 0.4rem; border-radius: 4px; transition: all 0.2s; display: flex; align-items: center; }
        .action-btn.edit { color: var(--text-secondary); }
        .action-btn.edit:hover { color: var(--accent); }
        .action-btn.delete { color: var(--text-secondary); }
        .action-btn.delete:hover { color: var(--danger); }
        .loading, .empty { padding: 3rem; text-align: center; color: var(--text-secondary); }
        @media (max-width: 768px) {
          .table-header { display: none; }
          .table-row { grid-template-columns: 1fr auto; }
          .col-category, .col-date, .col-photos { display: none; }
        }
      `}</style>
    </div>
  );
}

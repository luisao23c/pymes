import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Photo } from '../../types';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiArrowLeft, FiImage, FiTrash2 } from 'react-icons/fi';

const CATEGORIES = ['bodas', 'retratos', 'paisajes', 'eventos', 'editorial', 'otro'];

export default function AdminEventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    category: 'otro',
    featured: false,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.events.list({ limit: '100' }).then((data) => {
        const event = data.events.find((e: any) => e._id === id);
        if (event) {
          setForm({
            title: event.title,
            description: event.description,
            date: event.date.split('T')[0],
            category: event.category,
            featured: event.featured,
          });
          if (event.coverImage) setCoverPreview(event.coverImage);
        }
      });
      api.photos.getByEvent(id).then(setPhotos).catch(() => {});
    }
  }, [id, isEdit]);

  const onDrop = (accepted: File[]) => {
    if (accepted[0]) {
      setCoverFile(accepted[0]);
      setCoverPreview(URL.createObjectURL(accepted[0]));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      toast.error('Título y fecha son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('category', form.category);
      formData.append('featured', String(form.featured));
      if (coverFile) formData.append('coverImage', coverFile);

      if (isEdit) {
        await api.events.update(id!, formData);
        toast.success('Evento actualizado');
      } else {
        await api.events.create(formData);
        toast.success('Evento creado');
      }
      navigate('/admin/eventos');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const onPhotosDrop = (accepted: File[]) => {
    const newFiles = [...uploadFiles, ...accepted].slice(0, 50);
    setUploadFiles(newFiles);
    const newPreviews = accepted.map((f) => URL.createObjectURL(f));
    setUploadPreviews([...uploadPreviews, ...newPreviews]);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(uploadFiles.filter((_, i) => i !== index));
    setUploadPreviews(uploadPreviews.filter((_, i) => i !== index));
  };

  const handleUploadPhotos = async () => {
    if (!id || uploadFiles.length === 0) return;
    setUploading(true);
    try {
      await api.upload.photos(id, uploadFiles);
      toast.success(`${uploadFiles.length} fotos subidas`);
      setUploadFiles([]);
      setUploadPreviews([]);
      const updatedPhotos = await api.photos.getByEvent(id);
      setPhotos(updatedPhotos);
    } catch {
      toast.error('Error al subir fotos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await api.photos.delete(photoId);
      setPhotos(photos.filter((p) => p._id !== photoId));
      toast.success('Foto eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const { getRootProps: getPhotosRootProps, getInputProps: getPhotosInputProps, isDragActive: isPhotosDragActive } = useDropzone({
    onDrop: onPhotosDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
  });

  return (
    <div className="admin-event-form">
      <button className="back-btn" onClick={() => navigate('/admin/eventos')}>
        <FiArrowLeft /> Volver
      </button>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
      </motion.h1>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-left">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nombre del evento"
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el evento..."
              rows={4}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Evento destacado
            </label>
          </div>
        </div>

        <div className="form-right">
          <label>Portada</label>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${coverPreview ? 'has-preview' : ''}`}
          >
            <input {...getInputProps()} />
            {coverPreview ? (
              <div className="preview-wrapper">
                <img src={coverPreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-preview"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverFile(null);
                    setCoverPreview('');
                  }}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="dropzone-content">
                <FiUpload />
                <p>{isDragActive ? 'Soltar imagen' : 'Arrastra una imagen o haz clic'}</p>
                <span>JPG, PNG, WebP</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear evento'}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="photo-upload-section">
          <h2>Fotos del Evento ({photos.length})</h2>
          <div
            {...getPhotosRootProps()}
            className={`dropzone photos-dropzone ${isPhotosDragActive ? 'active' : ''}`}
          >
            <input {...getPhotosInputProps()} />
            <div className="dropzone-content">
              <FiUpload />
              <p>{isPhotosDragActive ? 'Soltar fotos' : 'Arrastra múltiples fotos o haz clic'}</p>
              <span>Máximo 50 fotos por vez</span>
            </div>
          </div>

          {uploadPreviews.length > 0 && (
            <div className="upload-preview-grid">
              {uploadPreviews.map((preview, i) => (
                <div key={i} className="upload-preview-item">
                  <img src={preview} alt="" />
                  <button type="button" onClick={() => removeUploadFile(i)}><FiX /></button>
                </div>
              ))}
            </div>
          )}

          {uploadFiles.length > 0 && (
            <button className="btn-primary" onClick={handleUploadPhotos} disabled={uploading}>
              {uploading ? 'Subiendo...' : `Subir ${uploadFiles.length} fotos`}
            </button>
          )}

          {photos.length > 0 && (
            <div className="existing-photos">
              {photos.map((photo) => (
                <div key={photo._id} className="existing-photo">
                  <img src={photo.thumbnailPath} alt={photo.originalName} />
                  <button onClick={() => handleDeletePhoto(photo._id)}><FiTrash2 /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-event-form { }
        .back-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: none; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem; }
        .back-btn:hover { color: var(--accent); }
        .admin-event-form h1 { font-size: 1.8rem; font-weight: 200; letter-spacing: 0.05em; margin-bottom: 2rem; }
        .form-container { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .form-left { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-right { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-right > label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .form-group input, .form-group textarea, .form-group select { background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); padding: 0.8rem 1rem; font-size: 0.9rem; border-radius: 2px; transition: border-color 0.3s; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--accent); }
        .form-group select { appearance: none; cursor: pointer; }
        .checkbox-label { display: flex !important; flex-direction: row !important; align-items: center; gap: 0.5rem; cursor: pointer; }
        .checkbox-label input { width: auto; accent-color: var(--accent); }
        .dropzone { border: 2px dashed var(--border); border-radius: 4px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.3s; min-height: 200px; display: flex; align-items: center; justify-content: center; }
        .dropzone:hover, .dropzone.active { border-color: var(--accent); }
        .dropzone.has-preview { padding: 0; border-style: solid; }
        .dropzone-content { color: var(--text-muted); }
        .dropzone-content svg { font-size: 2rem; margin-bottom: 0.5rem; }
        .dropzone-content p { font-size: 0.9rem; margin-bottom: 0.25rem; }
        .dropzone-content span { font-size: 0.75rem; }
        .preview-wrapper { position: relative; width: 100%; }
        .preview-wrapper img { width: 100%; border-radius: 2px; }
        .remove-preview { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.7); color: white; padding: 0.3rem; border-radius: 4px; }
        .form-actions { grid-column: 1 / -1; padding-top: 1rem; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.8rem 2rem; background: var(--accent); color: var(--bg-primary); font-size: 0.85rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid var(--accent); border-radius: 2px; transition: all 0.3s; }
        .btn-primary:hover:not(:disabled) { background: transparent; color: var(--accent); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .form-container { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
        .photo-upload-section { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border); }
        .photo-upload-section h2 { font-size: 1.2rem; font-weight: 300; margin-bottom: 1rem; }
        .photos-dropzone { min-height: 120px; }
        .upload-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.75rem; margin-top: 1rem; }
        .upload-preview-item { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; }
        .upload-preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .upload-preview-item button { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; }
        .existing-photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem; margin-top: 1.5rem; }
        .existing-photo { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; border: 1px solid var(--border); }
        .existing-photo img { width: 100%; height: 100%; object-fit: cover; }
        .existing-photo button { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: var(--danger); padding: 4px; border-radius: 4px; }
      `}</style>
    </div>
  );
}

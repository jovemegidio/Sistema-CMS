import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';
import { showToast, ToastContainer } from '../../components/Toast';

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6',
  '#06b6d4', '#ef4444', '#f97316', '#14b8a6', '#3b82f6',
];

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/categories/${id}`);
      const cat = response.data.category;
      setName(cat.name);
      setDescription(cat.description || '');
      setColor(cat.color || '#6366f1');
    } catch {
      showToast('Failed to load category', 'error');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { name, description, color };

      if (isEditing) {
        await api.put(`/categories/${id}`, payload);
        showToast('Category updated successfully', 'success');
      } else {
        await api.post('/categories', payload);
        showToast('Category created successfully', 'success');
      }

      setTimeout(() => navigate('/categories'), 1000);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-back">
          <button className="btn btn-ghost" onClick={() => navigate('/categories')}>
            <ArrowLeft size={18} />
            Back to Categories
          </button>
          <h1>{isEditing ? 'Edit Category' : 'Create New Category'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card form-narrow">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-option ${color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/categories')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <div className="loading-spinner small" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}

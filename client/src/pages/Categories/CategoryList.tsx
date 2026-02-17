import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { showToast, ToastContainer } from '../../components/Toast';
import { format } from 'date-fns';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
  created_at: string;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/categories/${deleteId}`);
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete category', 'error');
    }
    setDeleteId(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (cat: Category) => (
        <div className="category-cell">
          <div className="color-dot" style={{ background: cat.color }} />
          <div>
            <span className="category-name">{cat.name}</span>
            <span className="category-slug">/{cat.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (cat: Category) => (
        <span className="text-truncate">{cat.description || '—'}</span>
      ),
    },
    {
      key: 'post_count',
      label: 'Posts',
      render: (cat: Category) => (
        <span className="count-badge">{cat.post_count}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (cat: Category) => format(new Date(cat.created_at), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (cat: Category) => (
        <div className="table-actions-cell">
          <button
            className="icon-btn small"
            onClick={() => navigate(`/categories/${cat.id}/edit`)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="icon-btn small danger"
            onClick={() => setDeleteId(cat.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="page-subtitle">Organize your content with categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/categories/new')}>
          <Plus size={18} />
          New Category
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found. Create your first category!"
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Category"
        message="Are you sure? Posts in this category will be uncategorized."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ToastContainer />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { showToast, ToastContainer } from '../../components/Toast';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  status: string;
  author_name: string;
  category_name: string;
  category_color: string;
  views: number;
  created_at: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await api.get('/posts', { params });
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/posts/${deleteId}`);
      showToast('Post deleted successfully', 'success');
      fetchPosts();
    } catch {
      showToast('Failed to delete post', 'error');
    }
    setDeleteId(null);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (post: Post) => (
        <div className="post-title-cell">
          <span className="post-title">{post.title}</span>
          <span className="post-author">by {post.author_name}</span>
        </div>
      ),
    },
    {
      key: 'category_name',
      label: 'Category',
      render: (post: Post) =>
        post.category_name ? (
          <span className="category-tag" style={{ background: `${post.category_color}20`, color: post.category_color }}>
            {post.category_name}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (post: Post) => (
        <span className={`status-badge status-${post.status}`}>{post.status}</span>
      ),
    },
    {
      key: 'views',
      label: 'Views',
      render: (post: Post) => (
        <span className="views-count">
          <Eye size={14} /> {post.views}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (post: Post) => format(new Date(post.created_at), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (post: Post) => (
        <div className="table-actions-cell">
          <button
            className="icon-btn small"
            onClick={() => navigate(`/posts/${post.id}/edit`)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="icon-btn small danger"
            onClick={() => setDeleteId(post.id)}
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
          <h1>Posts</h1>
          <p className="page-subtitle">Manage your blog posts and articles</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/posts/new')}>
          <Plus size={18} />
          New Post
        </button>
      </div>

      <div className="filter-bar">
        {['all', 'published', 'draft', 'archived'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => { setStatusFilter(status); setPage(1); }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Search posts..."
        emptyMessage="No posts found. Create your first post!"
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ToastContainer />
    </div>
  );
}

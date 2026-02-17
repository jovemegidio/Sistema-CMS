import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';
import RichEditor from '../../components/RichEditor';
import { showToast, ToastContainer } from '../../components/Toast';

interface Category {
  id: string;
  name: string;
}

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('draft');
  const [categoryId, setCategoryId] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchPost();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/posts/${id}`);
      const post = response.data.post;
      setTitle(post.title);
      setContent(post.content || '');
      setExcerpt(post.excerpt || '');
      setStatus(post.status);
      setCategoryId(post.category_id || '');
      setCoverImage(post.cover_image || '');
    } catch {
      showToast('Failed to load post', 'error');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title,
        content,
        excerpt,
        status,
        category_id: categoryId || null,
        cover_image: coverImage || null,
      };

      if (isEditing) {
        await api.put(`/posts/${id}`, payload);
        showToast('Post updated successfully', 'success');
      } else {
        await api.post('/posts', payload);
        showToast('Post created successfully', 'success');
      }

      setTimeout(() => navigate('/posts'), 1000);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save post', 'error');
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
          <button className="btn btn-ghost" onClick={() => navigate('/posts')}>
            <ArrowLeft size={18} />
            Back to Posts
          </button>
          <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-layout">
          <div className="form-main">
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  required
                  className="input-lg"
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <RichEditor value={content} onChange={setContent} />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="form-sidebar">
            <div className="form-card">
              <h3>Publish</h3>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/posts')}>
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
                      {isEditing ? 'Update' : 'Publish'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="form-card">
              <h3>Category</h3>
              <div className="form-group">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-card">
              <h3>Cover Image</h3>
              <div className="form-group">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Image URL..."
                />
                {coverImage && (
                  <div className="cover-preview">
                    <img src={coverImage} alt="Cover preview" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}

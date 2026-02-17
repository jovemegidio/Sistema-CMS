import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';
import { showToast, ToastContainer } from '../../components/Toast';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('author');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      const u = response.data.user;
      setName(u.name);
      setEmail(u.email);
      setRole(u.role);
      setBio(u.bio || '');
      setIsActive(!!u.is_active);
    } catch {
      showToast('Failed to load user', 'error');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, any> = { name, email, role, bio, is_active: isActive };
      if (password) payload.password = password;

      if (isEditing) {
        await api.put(`/users/${id}`, payload);
        showToast('User updated successfully', 'success');
      } else {
        if (!password) {
          showToast('Password is required for new users', 'error');
          setSaving(false);
          return;
        }
        payload.password = password;
        await api.post('/users', payload);
        showToast('User created successfully', 'success');
      }

      setTimeout(() => navigate('/users'), 1000);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save user', 'error');
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
          <button className="btn btn-ghost" onClick={() => navigate('/users')}>
            <ArrowLeft size={18} />
            Back to Users
          </button>
          <h1>{isEditing ? 'Edit User' : 'Create New User'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card form-narrow">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password {isEditing && <span className="label-hint">(leave blank to keep current)</span>}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditing ? '••••••••' : 'Min. 6 characters'}
            required={!isEditing}
            minLength={6}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="author">Author</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A brief description..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
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
                {isEditing ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}

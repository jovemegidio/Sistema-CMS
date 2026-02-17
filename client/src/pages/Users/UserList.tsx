import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { showToast, ToastContainer } from '../../components/Toast';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: number;
  post_count: number;
  created_at: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  admin: <ShieldAlert size={14} />,
  editor: <ShieldCheck size={14} />,
  author: <Shield size={14} />,
};

export default function UserList() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const response = await api.get('/users', { params });
      setUsers(response.data.users);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/${deleteId}`);
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
    setDeleteId(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (u: UserItem) => (
        <div className="user-cell">
          <div className="user-avatar small">{u.name.charAt(0).toUpperCase()}</div>
          <div>
            <span className="user-cell-name">{u.name}</span>
            <span className="user-cell-email">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u: UserItem) => (
        <span className={`role-badge role-${u.role}`}>
          {roleIcons[u.role]} {u.role}
        </span>
      ),
    },
    {
      key: 'post_count',
      label: 'Posts',
      render: (u: UserItem) => <span className="count-badge">{u.post_count}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (u: UserItem) => (
        <span className={`status-badge ${u.is_active ? 'status-published' : 'status-archived'}`}>
          {u.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (u: UserItem) => format(new Date(u.created_at), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u: UserItem) => (
        <div className="table-actions-cell">
          <button
            className="icon-btn small"
            onClick={() => navigate(`/users/${u.id}/edit`)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          {u.id !== currentUser?.id && (
            <button
              className="icon-btn small danger"
              onClick={() => setDeleteId(u.id)}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">Manage team members and their roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/users/new')}>
          <Plus size={18} />
          New User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onSearch={(q) => { setSearch(q); }}
        searchPlaceholder="Search users..."
        emptyMessage="No users found."
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete User"
        message="Are you sure? All posts by this user will also be deleted."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ToastContainer />
    </div>
  );
}

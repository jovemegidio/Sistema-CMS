import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FileText, FolderOpen, Users, Eye, TrendingUp, Plus, Image } from 'lucide-react';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import { format } from 'date-fns';

interface DashboardData {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalCategories: number;
    totalUsers: number;
    totalMedia: number;
    totalViews: number;
  };
  charts: {
    postsOverTime: { month: string; count: number }[];
    postsByCategory: { name: string; color: string; count: number }[];
    postsByStatus: { status: string; count: number }[];
  };
  recent: {
    posts: any[];
    users: any[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  draft: '#f59e0b',
  archived: '#6b7280',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner large" />
      </div>
    );
  }

  if (!data) return null;

  const monthNames: Record<string, string> = {};
  data.charts.postsOverTime.forEach((item) => {
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    monthNames[item.month] = format(date, 'MMM yyyy');
  });

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's an overview of your content.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/posts/new')}>
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Posts"
          value={data.stats.totalPosts}
          icon={<FileText size={24} />}
          color="#6366f1"
        />
        <StatsCard
          title="Published"
          value={data.stats.publishedPosts}
          icon={<TrendingUp size={24} />}
          color="#10b981"
        />
        <StatsCard
          title="Categories"
          value={data.stats.totalCategories}
          icon={<FolderOpen size={24} />}
          color="#f59e0b"
        />
        <StatsCard
          title="Total Views"
          value={data.stats.totalViews.toLocaleString()}
          icon={<Eye size={24} />}
          color="#ec4899"
        />
        <StatsCard
          title="Users"
          value={data.stats.totalUsers}
          icon={<Users size={24} />}
          color="#8b5cf6"
        />
        <StatsCard
          title="Media Files"
          value={data.stats.totalMedia}
          icon={<Image size={24} />}
          color="#06b6d4"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Posts Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.postsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickFormatter={(val) => monthNames[val] || val}
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                }}
                labelFormatter={(val) => monthNames[val] || val}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Posts by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.postsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="count"
                nameKey="name"
                label={({ name, count }) => `${name} (${count})`}
                labelLine={false}
              >
                {data.charts.postsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-grid">
        <div className="recent-card">
          <div className="recent-header">
            <h3>Recent Posts</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/posts')}>
              View All
            </button>
          </div>
          <div className="recent-list">
            {data.recent.posts.map((post) => (
              <div key={post.id} className="recent-item">
                <div className="recent-item-info">
                  <span className="recent-item-title">{post.title}</span>
                  <span className="recent-item-meta">
                    by {post.author_name} • {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="recent-item-right">
                  <span className={`status-badge status-${post.status}`}>
                    {post.status}
                  </span>
                  <span className="recent-item-views">{post.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-card">
          <div className="recent-header">
            <h3>Recent Users</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/users')}>
              View All
            </button>
          </div>
          <div className="recent-list">
            {data.recent.users.map((user) => (
              <div key={user.id} className="recent-item">
                <div className="recent-item-info">
                  <div className="user-avatar small">{user.name.charAt(0)}</div>
                  <div>
                    <span className="recent-item-title">{user.name}</span>
                    <span className="recent-item-meta">{user.email}</span>
                  </div>
                </div>
                <span className={`role-badge role-${user.role}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

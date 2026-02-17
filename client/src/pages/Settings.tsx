import { useState } from 'react';
import { Save, User, Lock, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { showToast, ToastContainer } from '../components/Toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put('/auth/profile', { name, bio });
      updateUser(response.data.user);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/profile', { currentPassword, newPassword });
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'password', label: 'Password', icon: <Lock size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="form-card">
              <h3>Profile Information</h3>
              <p className="form-description">Update your personal information visible across the platform.</p>

              <div className="profile-header-section">
                <div className="user-avatar large">{user?.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                  <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <div className="loading-spinner small" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordUpdate} className="form-card">
              <h3>Change Password</h3>
              <p className="form-description">Ensure your account is using a strong, secure password.</p>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                  {savingPassword ? (
                    <>
                      <div className="loading-spinner small" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="form-card">
              <h3>Appearance</h3>
              <p className="form-description">Customize the look and feel of your admin panel.</p>

              <div className="appearance-options">
                <p>
                  Toggle between light and dark themes using the <strong>moon/sun icon</strong> in the header.
                  Your preference is automatically saved.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

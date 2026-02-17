import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cms_theme') as 'light' | 'dark') || 'light';
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('cms_theme', newTheme);
  };

  return (
    <div className={`admin-layout ${theme}`} data-theme={theme}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`main-area ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Header
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

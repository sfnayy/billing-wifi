import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wifi, Users, PieChart, Home, LogOut, Bell, Search,
  User as UserIcon, Package, ChevronRight, Menu, X,
  LayoutDashboard, FileBarChart2, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminName = user?.name || 'Admin';
  const adminEmail = user?.email || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuGroups = [
    {
      label: 'Utama',
      items: [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
      ]
    },
    {
      label: 'Manajemen',
      items: [
        { path: '/admin/users', icon: <Users size={20} />, label: 'Data Pelanggan' },
        { path: '/admin/packages', icon: <Package size={20} />, label: 'Data Paket' },
      ]
    },
    {
      label: 'Analitik',
      items: [
        { path: '/admin/reports', icon: <FileBarChart2 size={20} />, label: 'Laporan & Statistik' },
      ]
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
  };

  const currentLabel = menuGroups
    .flatMap(g => g.items)
    .find(m => isActive(m.path, m.exact))?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-brand-700/50">
        <div className="bg-white/10 p-2 rounded-xl text-white backdrop-blur-sm">
          <Wifi size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">NetBilling</h1>
          <span className="text-[10px] font-medium text-brand-200 tracking-wider">Sistem Billing WiFi</span>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="mx-4 mt-5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-400/30 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {adminName.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{adminName}</p>
          <p className="text-[11px] text-brand-300 truncate">{adminEmail}</p>
        </div>
        <span className="ml-auto shrink-0 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-6 space-y-6 overflow-y-auto">
        {menuGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(item => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group ${
                      active
                        ? 'bg-white text-brand-700 shadow-lg shadow-black/10'
                        : 'text-brand-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={active ? 'text-brand-600' : 'text-brand-300 group-hover:text-white transition-colors'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={14} className="text-brand-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-brand-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-brand-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium group"
        >
          <LogOut size={20} className="group-hover:text-rose-400 transition-colors" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-gradient-to-b from-brand-800 to-brand-900 shadow-2xl z-20 flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile (Drawer) */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-brand-800 to-brand-900 shadow-2xl z-40 flex flex-col transition-transform duration-300 md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-1"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="text-lg font-bold text-slate-800">{currentLabel}</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 w-44 transition-all focus:w-56"
              />
            </div>

            <button className="relative text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-xl hover:bg-brand-50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{adminName}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

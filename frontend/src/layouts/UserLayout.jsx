import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wifi, Home, CreditCard, LogOut, Bell, Menu, X,
  ChevronRight, UserCircle, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const userName = user?.name || 'Pelanggan';

  // Fetch jumlah tagihan pending untuk badge notifikasi
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`\${import.meta.env.VITE_API_URL}/invoices/customer/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const pending = data.filter(inv => inv.status === 0 || inv.status === 'pending');
          setPendingCount(pending.length);
        }
      } catch (e) {
        // silent fail
      }
    };
    fetchPendingCount();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuGroups = [
    {
      label: 'Menu Utama',
      items: [
        { path: '/user', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
        { path: '/user/payment', icon: <CreditCard size={20} />, label: 'Tagihan Saya', badge: pendingCount },
      ]
    },
    {
      label: 'Akun Saya',
      items: [
        { path: '/user/profile', icon: <UserCircle size={20} />, label: 'Profil & Biodata' },
      ]
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || (path !== '/user' && location.pathname.startsWith(path));
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
          <span className="text-[10px] font-medium text-brand-200 tracking-wider">Portal Pelanggan</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 mt-5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dbeafe&color=1e40af&size=40`}
          alt="avatar"
          className="w-10 h-10 rounded-xl shrink-0"
        />
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{userName}</p>
          <p className="text-[11px] text-brand-300 truncate">
            {user?.plan || 'Belum Memilih Paket'}
          </p>
        </div>
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
                    {item.badge > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && !item.badge && <ChevronRight size={14} className="text-brand-400" />}
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
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="text-lg font-bold text-slate-800">{currentLabel}</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/user/payment')}
              className="relative text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-xl hover:bg-brand-50"
              title={pendingCount > 0 ? `${pendingCount} tagihan menunggu` : 'Tidak ada tagihan tertunggak'}
            >
              <Bell size={20} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/user/profile')}
              className="flex items-center gap-2.5 pl-4 border-l border-slate-200 group"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dbeafe&color=1e40af&size=32`}
                alt="avatar"
                className="w-8 h-8 rounded-xl ring-2 ring-transparent group-hover:ring-brand-400 transition-all"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-brand-600 transition-colors">
                  {userName}
                </p>
                <p className="text-xs text-slate-400">Pelanggan</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

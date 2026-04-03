import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Wifi, Users, PieChart, Home, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 glass shadow-xl z-10 flex flex-col hidden md:flex border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-xl text-white shadow-lg">
            <Wifi size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">NetBilling</h1>
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-all font-medium">
            <Home size={20} /><span>Overview</span>
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-all font-medium">
            <Users size={20} /><span>Pelanggan</span>
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-all font-medium">
            <PieChart size={20} /><span>Laporan</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200/60">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto w-full p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

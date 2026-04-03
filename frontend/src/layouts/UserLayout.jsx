import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Wifi, Home, CreditCard, LogOut, User } from 'lucide-react';

export default function UserLayout() {
  const navigate = useNavigate();
  const userName = JSON.parse(localStorage.getItem('user') || '{}').name || 'Pelanggan';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 glass shadow-xl z-10 flex flex-col hidden md:flex border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brand-500 p-2 rounded-xl text-white shadow-lg shadow-brand-500/30">
            <Wifi size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">NetBilling</h1>
        </div>
        
        <div className="px-6 py-2 mb-4">
          <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
          <div className="flex items-center gap-2 mt-1">
            <User size={16} className="text-brand-600"/>
            <p className="text-sm font-bold text-slate-700 truncate">{userName}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          <Link to="/user" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-brand-600 transition-all font-medium">
            <Home size={20} /><span>Pilih Paket</span>
          </Link>
          <Link to="/user/payment" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-brand-600 transition-all font-medium">
            <CreditCard size={20} /><span>Bayar Tagihan</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200/60">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition-colors">
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

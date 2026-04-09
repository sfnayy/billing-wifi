import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Wifi, Home, CreditCard, LogOut, User as UserIcon, Bell, Settings } from 'lucide-react';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = JSON.parse(localStorage.getItem('user') || '{}').name || 'Pelanggan';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/user', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/user/payment', icon: <CreditCard size={20} />, label: 'Tagihan Saya' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar (Blue Theme) */}
      <aside className="w-64 bg-brand-800 shadow-xl z-20 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-brand-700/50">
          <div className="bg-white/10 p-2 rounded-xl text-white backdrop-blur-sm">
            <Wifi size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">NetBilling</h1>
            <span className="text-[10px] font-medium text-brand-200 tracking-wider">Sistem Billing WiFi</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/user' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive 
                  ? 'bg-brand-700 text-white shadow-sm' 
                  : 'text-brand-100 hover:bg-brand-700/50 hover:text-white'
                }`}
              >
                {item.icon}<span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-brand-700/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-brand-200 hover:text-white hover:bg-brand-700/50 rounded-lg transition-colors font-medium">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar (White) */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
             <div className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-brand-600"><Home size={20}/></span> Dashboard
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-slate-400 hover:text-brand-600 cursor-pointer hidden md:block">
               <Settings size={20} />
             </div>
             <div className="text-slate-400 hover:text-brand-600 cursor-pointer hidden md:block relative">
               <Bell size={20} />
             </div>
             <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
               <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${userName}&background=dbeafe&color=2563eb`} alt="avatar" />
               </div>
               <div className="hidden md:block text-right">
                 <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                 <p className="text-xs text-slate-400">Pelanggan</p>
               </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

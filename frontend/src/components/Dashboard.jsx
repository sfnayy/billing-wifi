import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const data = [
  { name: 'Senin', revenue: 400000 },
  { name: 'Selasa', revenue: 300000 },
  { name: 'Rabu', revenue: 550000 },
  { name: 'Kamis', revenue: 450000 },
  { name: 'Jumat', revenue: 600000 },
  { name: 'Sabtu', revenue: 800000 },
  { name: 'Minggu', revenue: 750000 },
];

export default function Dashboard() {
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        if (res.data) {
          setActiveUsersCount(res.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch user stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Overview</h2>
        <p className="text-slate-500 mt-1">Performa billing jaringan WiFi Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pelanggan Aktif" amount={activeUsersCount} icon={<Users size={24} />} color="bg-brand-700" />
        <StatCard title="Tagihan Bulan Ini" amount="Rp 32.500.000" icon={<Activity size={24} />} color="bg-cyan-600" />
        <StatCard title="Pendapatan Bersih" amount="Rp 28.000.000" icon={<CheckCircle size={24} />} color="bg-emerald-500" />
        <StatCard title="Pelanggan Menunggak" amount="32" icon={<Clock size={24} />} color="bg-rose-500" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Pendapatan Bulanan</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `Rp${value/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color }) {
  return (
    <div className={`${color} rounded-xl p-5 shadow-sm text-white relative overflow-hidden transition-transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-white/80 text-xs font-semibold mb-1">{title}</p>
          <h4 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">{amount}</h4>
        </div>
        <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner">
          {icon}
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
    </div>
  );
}

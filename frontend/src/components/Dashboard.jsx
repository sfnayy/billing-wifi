import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Overview</h2>
        <p className="text-slate-500 mt-1">Performa billing jaringan WiFi Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pendapatan" amount="Rp 3.850.000" icon={<Activity className="text-brand-500" />} trend="+12.5%" />
        <StatCard title="Pelanggan Aktif" amount="124" icon={<Users className="text-blue-500" />} trend="+4" />
        <StatCard title="Tagihan Lunas" amount="98" icon={<CheckCircle className="text-emerald-500" />} trend="+15" />
        <StatCard title="Menunggu Pembayaran" amount="26" icon={<Clock className="text-amber-500" />} trend="-3" />
      </div>

      <div className="glass rounded-3xl p-6 shadow-sm border border-slate-200/60 mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Grafik Pendapatan Mingguan</h3>
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

function StatCard({ title, amount, icon, trend }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="glass rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
          {icon}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 mt-1">{amount}</h4>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, Clock, TrendingUp, Wifi, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    chartData: [],
    packageDistribution: [],
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, invoicesRes, packagesRes] = await Promise.all([
          fetch(import.meta.env.VITE_API_URL + '/users').catch(() => null),
          fetch(import.meta.env.VITE_API_URL + '/invoices').catch(() => null),
          fetch(import.meta.env.VITE_API_URL + '/packages').catch(() => null),
        ]);

        let users = [];
        let invoices = [];
        let packages = [];

        if (usersRes?.ok) users = await usersRes.json();
        if (invoicesRes?.ok) invoices = await invoicesRes.json();
        if (packagesRes?.ok) packages = await packagesRes.json();

        // Stats dasar
        const activeUsers = users.filter(u => u.role === 'user').length;
        let totalRevenue = 0;
        let paidInvoices = 0;
        let pendingInvoices = 0;

        // Chart mingguan
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          chartData.push({
            name: days[d.getDay()],
            dateString: d.toDateString(),
            pendapatan: 0,
            tagihan: 0,
          });
        }

        // Distribusi paket
        const pkgCountMap = {};

        invoices.forEach(inv => {
          const isPaid = inv.status === 1 || inv.status === 'success' || inv.status === 'settlement';
          const isPending = inv.status === 0 || inv.status === 'pending';
          const amount = Number(inv.totalAmount) || 0;

          if (isPaid) {
            totalRevenue += amount;
            paidInvoices++;
            const invDate = new Date(inv.invoiceDate).toDateString();
            const chartIdx = chartData.findIndex(c => c.dateString === invDate);
            if (chartIdx !== -1) chartData[chartIdx].pendapatan += amount;
          } else if (isPending) {
            pendingInvoices++;
          }

          // Hitung tagihan per hari di chart
          const invDate2 = new Date(inv.invoiceDate || inv.createdDate).toDateString();
          const cIdx = chartData.findIndex(c => c.dateString === invDate2);
          if (cIdx !== -1) chartData[cIdx].tagihan++;
        });

        // Recent invoices (5 terbaru)
        const sorted = [...invoices].sort((a, b) =>
          new Date(b.invoiceDate || b.createdDate) - new Date(a.invoiceDate || a.createdDate)
        );
        const recentInvoices = sorted.slice(0, 5);

        // Distribusi paket berdasarkan nama dari users
        const pkgActive = packages.filter(p => !p.isDeleted && p.status === 1);
        const pkgDistribution = pkgActive.map(pkg => {
          const count = users.filter(u => u.plan === pkg.packageName).length;
          return { name: pkg.packageName, pelanggan: count };
        }).filter(p => p.pelanggan > 0);

        setStats({
          totalRevenue,
          activeUsers,
          paidInvoices,
          pendingInvoices,
          chartData: chartData.map(c => ({ name: c.name, pendapatan: c.pendapatan, tagihan: c.tagihan })),
          packageDistribution: pkgDistribution,
          recentInvoices,
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-3xl" />)}
        </div>
        <div className="h-72 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      icon: <Activity size={22} />,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      trend: '+',
      desc: 'Seluruh periode',
    },
    {
      title: 'Total Pelanggan',
      value: stats.activeUsers,
      icon: <Users size={22} />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      trend: '+',
      desc: 'User terdaftar',
    },
    {
      title: 'Tagihan Lunas',
      value: stats.paidInvoices,
      icon: <CheckCircle size={22} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+',
      desc: 'Total dibayar',
    },
    {
      title: 'Menunggu Bayar',
      value: stats.pendingInvoices,
      icon: <Clock size={22} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: stats.pendingInvoices > 0 ? '!' : '✓',
      desc: 'Perlu tindakan',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">Selamat datang kembali! Berikut ringkasan hari ini.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <Wifi size={15} className="text-brand-500" />
          <span>NetBilling WiFi</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                card.trend === '+' ? 'bg-emerald-100 text-emerald-700' :
                card.trend === '!' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {card.trend === '+' ? <ArrowUpRight size={12} className="inline" /> : null}
                {card.trend === '!' ? '⚠' : card.trend === '+' ? ' Aktif' : ' Aman'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart Pendapatan */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pendapatan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-400 mt-0.5">Grafik pendapatan harian</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
              <TrendingUp size={13} /> Mingguan
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `Rp${v / 1000}k`} />
                <Tooltip
                  formatter={v => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Pendapatan']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="pendapatan" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Distribusi Paket */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">Distribusi Paket</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pelanggan per paket aktif</p>
          </div>
          {stats.packageDistribution.length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.packageDistribution} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={v => [v, 'Pelanggan']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="pelanggan" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-slate-400">
              <Wifi size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Belum ada data distribusi</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Aktivitas Tagihan Terbaru</h3>
          <span className="text-xs text-slate-400 font-medium">5 data terbaru</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Tagihan</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recentInvoices.length > 0 ? stats.recentInvoices.map(inv => {
                const isPaid = inv.status === 1 || inv.status === 'success' || inv.status === 'settlement';
                const isPending = inv.status === 0 || inv.status === 'pending';
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-slate-500">{inv.id?.slice(0, 10)}...</td>
                    <td className="py-4 px-6 text-sm text-slate-700">
                      {new Date(inv.invoiceDate || inv.createdDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">
                      Rp {Number(inv.totalAmount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' :
                        isPending ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {isPaid ? '✓ Lunas' : isPending ? '⏳ Pending' : '✗ Gagal'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400 text-sm">
                    Belum ada data tagihan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

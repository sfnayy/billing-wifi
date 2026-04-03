import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wifi, Check } from 'lucide-react';

const PLANS = [
  { id: '10mbps', name: 'Paket Hemat - 10 Mbps', price: 150000, features: ['10 Mbps Unlimited', 'Ideal 2-3 Gadget', 'Support 24/7'] },
  { id: '20mbps', name: 'Paket Keluarga - 20 Mbps', price: 250000, features: ['20 Mbps Unlimited', 'Ideal 4-6 Gadget', 'Prioritas Support', 'Router Dual-Band'] },
  { id: '50mbps', name: 'Paket Pro - 50 Mbps', price: 400000, features: ['50 Mbps Unlimited', 'Gadget Tak Terbatas', 'Support VIP 24/7', 'IP Public'] },
];

export default function UserDashboard() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handlePilihPaket = async (planName, price) => {
    if(!window.confirm(`Anda ingin mengubah paket ke ${planName}?`)) return;
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/users/${user.id}`, { plan: planName });
      user.plan = planName; // Update local
      localStorage.setItem('user', JSON.stringify(user));
      alert('Paket berhasil dipilih! Silakan lanjut ke Pembayaran.');
      navigate('/user/payment', { state: { amount: price } });
    } catch (error) {
      alert("Gagal mengupdate paket ke backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Katalog Paket</h2>
        <p className="text-slate-500 mt-1">Paket Internet WiFi yang tersedia untuk Anda.</p>
      </div>

      <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Paket Anda Saat Ini:</p>
          <p className="text-xl font-bold text-brand-900">{user.plan || "Belum ada paket aktif"}</p>
        </div>
        <Wifi className="text-brand-500 w-10 h-10 opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {PLANS.map((plan) => (
          <div key={plan.id} className="glass rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wifi size={100} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-black text-brand-600">Rp{plan.price / 1000}</span>
              <span className="text-slate-500 font-medium tracking-tight"> Ribu / Bulan</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center text-sm text-slate-600 font-medium">
                  <Check size={16} className="text-brand-500 mr-2 shrink-0"/> {f}
                </li>
              ))}
            </ul>
            <button 
              disabled={loading}
              onClick={() => handlePilihPaket(plan.name, plan.price)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
              Pilih Paket Ini
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

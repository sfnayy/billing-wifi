import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CreditCard, Loader } from 'lucide-react';

export default function UserPayment() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Ambil amount dari navigasi jika ada, jika tidak default.
  // Dalam aplikasi nyata, amount ditarik dari database backend berdasarkan `user.plan`
  const defaultAmount = location.state?.amount || 150000;
  
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/payment/charge', {
        amount: defaultAmount,
        customer_name: user.name || "Pelanggan Biasa",
        customer_email: user.email || "user@example.com"
      });

      const { token } = response.data;
      if (!window.snap) {
         alert("Midtrans Snap belum dimuat! Pastikan Client Key benar di index.html");
         return;
      }

      window.snap.pay(token, {
        onSuccess: function(result){ alert("Pembayaran Berhasil! Terima kasih."); console.log(result); },
        onPending: function(result){ alert("Menunggu pembayaran..."); console.log(result); },
        onError: function(result){ alert("Pembayaran Gagal!"); console.log(result); },
        onClose: function(){ alert("Anda membatalkan pembayaran"); }
      });
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem saat mengambil transaksi. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Pembayaran</h2>
        <p className="text-slate-500 mt-1">Selesaikan pembayaran tagihan internet bulanan Anda.</p>
      </div>

      <div className="glass rounded-3xl p-8 shadow-lg border border-slate-200/60 mt-8">
        <div className="mb-8 flex items-center justify-center p-6 bg-brand-50 rounded-2xl border border-brand-100">
          <CreditCard className="text-brand-500 w-12 h-12 mr-4" />
          <div>
            <h3 className="text-brand-900 font-semibold text-lg">Tagihan Aktif ({user.plan || "Belum Memilih"})</h3>
            <p className="text-3xl font-black text-brand-600 mt-1">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(defaultAmount)}
            </p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Penerima Tagihan</label>
            <input type="text" value={user.name || ""} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-500/30 transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:shadow-none">
            {loading ? <Loader className="animate-spin" /> : "Bayar Sekarang dengan Midtrans"}
          </button>
        </form>
      </div>
    </div>
  );
}

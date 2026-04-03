import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, Loader } from 'lucide-react';

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(150000);
  const [name, setName] = useState("Pelanggan WiFi");

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Panggil backend API untuk mendapatkan token transaksi Midtrans
      // Catatan: Pastikan backend berjalan dan URL API sesuai
      const response = await axios.post('http://localhost:5000/api/payment/charge', {
        amount,
        customer_name: name,
        customer_email: "pelanggan@example.com"
      });

      const { token } = response.data;

      // Jalankan Midtrans Snap
      window.snap.pay(token, {
        onSuccess: function(result){
          alert("Pembayaran Berhasil! Terima kasih.");
          console.log(result);
        },
        onPending: function(result){
          alert("Menunggu pembayaran...");
          console.log(result);
        },
        onError: function(result){
          alert("Pembayaran Gagal!");
          console.log(result);
        },
        onClose: function(){
          alert("Anda menutup popup tanpa menyelesakan pembayaran");
        }
      });

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat transaksi. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Pembayaran</h2>
        <p className="text-slate-500 mt-1">Lakukan pembayaran tagihan WiFi bulanan Anda.</p>
      </div>

      <div className="glass rounded-3xl p-8 shadow-lg border border-slate-200/60 mt-8">
        <div className="mb-8 flex items-center justify-center p-6 bg-brand-50 rounded-2xl border border-brand-100">
          <CreditCard className="text-brand-500 w-12 h-12 mr-4" />
          <div>
            <h3 className="text-brand-900 font-semibold text-lg">Tagihan Aktif</h3>
            <p className="text-2xl font-bold text-brand-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)}
            </p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Pelanggan</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Bayar (Rp)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-slate-50"
              readOnly
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <Loader className="animate-spin" /> : "Bayar Sekarang dengan Midtrans"}
          </button>
        </form>
      </div>
    </div>
  );
}

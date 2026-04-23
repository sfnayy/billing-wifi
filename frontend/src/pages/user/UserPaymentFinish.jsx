import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader, CheckCircle2, AlertTriangle, Hourglass } from 'lucide-react';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function UserPaymentFinish() {
  const query = useQuery();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, status: 'pending', message: 'Memverifikasi pembayaran...' });

  useEffect(() => {
    const orderId = query.get('order_id') || query.get('orderId');
    if (!orderId) {
      setState({ loading: false, status: 'failed', message: 'Order ID tidak ditemukan dari redirect Midtrans.' });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/payment/status/${encodeURIComponent(orderId)}`);
        const mapped = res.data?.mapped_status || res.data?.transaction_status || 'pending';
        if (cancelled) return;

        if (mapped === 'success' || mapped === 'settlement') {
          setState({ loading: false, status: 'success', message: 'Pembayaran sukses. Terima kasih!' });
          setTimeout(() => navigate('/user', { replace: true }), 900);
          return;
        }
        if (mapped === 'failed' || mapped === 'cancel' || mapped === 'deny' || mapped === 'expire') {
          setState({ loading: false, status: 'failed', message: 'Pembayaran gagal / dibatalkan.' });
          return;
        }

        setState({ loading: false, status: 'pending', message: 'Pembayaran masih pending. Silakan cek kembali beberapa saat lagi.' });
      } catch (e) {
        if (cancelled) return;
        const httpStatus = e?.response?.status;
        const serverMsg = e?.response?.data?.message;

        if (httpStatus === 404) {
          setState({
            loading: false,
            status: 'failed',
            message: serverMsg || 'Transaksi tidak ditemukan. Pastikan pembayaran dibuat dari halaman ini lalu coba lagi.'
          });
          return;
        }

        setState({
          loading: false,
          status: 'pending',
          message: serverMsg || 'Gagal verifikasi ke server. Coba refresh halaman ini.'
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, navigate]);

  const Icon = state.loading
    ? Loader
    : state.status === 'success'
      ? CheckCircle2
      : state.status === 'failed'
        ? AlertTriangle
        : Hourglass;

  const iconClass =
    state.loading ? 'text-slate-500 animate-spin'
      : state.status === 'success' ? 'text-emerald-600'
        : state.status === 'failed' ? 'text-rose-600'
          : 'text-amber-600';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="glass rounded-3xl p-8 shadow-lg border border-slate-200/60 mt-8 text-center">
        <div className="flex justify-center mb-4">
          <Icon className={`w-12 h-12 ${iconClass}`} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Status Pembayaran</h2>
        <p className="text-slate-600 mt-2">{state.message}</p>

        {!state.loading && (
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate('/user/payment', { replace: true })}
              className="px-5 py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Kembali ke Pembayaran
            </button>
            <button
              onClick={() => navigate('/user', { replace: true })}
              className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors"
            >
              Ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


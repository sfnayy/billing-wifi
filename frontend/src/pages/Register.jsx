import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Wifi, Loader, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/auth/register', formData);
      alert('Registrasi Berhasil! Silakan Login.');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registrasi Gagal!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-4">
          <div className="bg-brand-500 p-3 rounded-2xl text-white shadow-lg">
            <Wifi size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Daftar Akun Baru</h2>
        <p className="text-center text-slate-500 mb-7 text-sm">Buat akun untuk mengelola WiFi Anda</p>

        {error && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input type="text" onChange={e => setFormData({...formData, name: e.target.value})} required
              placeholder="Nama Anda"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" onChange={e => setFormData({...formData, email: e.target.value})} required
              placeholder="email@contoh.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required minLength={6}
                placeholder="Ulangi password Anda"
                className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 outline-none transition-all ${
                  confirmPassword && formData.password !== confirmPassword
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200'
                }`} />
              {confirmPassword && (
                <span className={`absolute inset-y-0 right-4 flex items-center text-sm font-semibold ${formData.password === confirmPassword ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formData.password === confirmPassword ? '✓' : '✗'}
                </span>
              )}
            </div>
            {confirmPassword && formData.password !== confirmPassword && (
              <p className="text-xs text-rose-500 mt-1">Password tidak cocok</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Daftar Sebagai</label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white text-slate-700 cursor-pointer"
            >
              <option value="user">👤 Pelanggan (User)</option>
              <option value="admin">🛡️ Administrator (Admin)</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader className="animate-spin" size={20}/> : "Daftar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

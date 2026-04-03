import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Wifi, Loader } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Registrasi Berhasil! Silakan Login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registrasi Gagal!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2 flex justify-center items-center gap-2">
          <Wifi className="text-brand-500"/> Daftar Akun Baru
        </h2>
        <p className="text-center text-slate-500 mb-8">Pilih role Anda untuk keperluan demo</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input type="text" onChange={e => setFormData({...formData, name: e.target.value})} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" onChange={e => setFormData({...formData, email: e.target.value})} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role (Khusus Simulasi)</label>
            <select onChange={e => setFormData({...formData, role: e.target.value})} value={formData.role}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none bg-white">
                <option value="user">Pelanggan (User)</option>
                <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center flex items-center justify-center gap-2">
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

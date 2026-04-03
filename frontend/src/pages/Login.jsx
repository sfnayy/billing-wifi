import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Wifi, Loader } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if(user.role === 'admin') navigate('/admin');
      else navigate('/user');
      
    } catch (error) {
      alert(error.response?.data?.message || 'Login Gagal!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-500 p-3 rounded-2xl text-white shadow-lg">
            <Wifi size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Selamat Datang Kembali</h2>
        <p className="text-center text-slate-500 mb-8">Masuk ke portal Billing WiFi Anda</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex justify-center flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" size={20}/> : "Masuk"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}

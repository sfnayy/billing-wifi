import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Wifi, Loader } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

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

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      const response = await axios.post('http://localhost:5000/api/auth/google', { 
        email: googleUser.email, 
        name: googleUser.displayName 
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if(user.role === 'admin') navigate('/admin');
      else navigate('/user');
      
    } catch (error) {
      console.error(error);
      alert('Login dengan Google Gagal!');
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
            className="w-full py-3 mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex justify-center items-center gap-2">
            {loading ? <Loader className="animate-spin" size={20}/> : "Masuk"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-slate-500 uppercase">atau lanjutkan dengan</span>
          <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
        </div>

        <button onClick={handleGoogleLogin} type="button"
          className="w-full py-3 mt-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-sm transition-all flex justify-center items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}

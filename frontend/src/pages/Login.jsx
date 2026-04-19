import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Wifi, Loader, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2FA
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sessionId, setSessionId] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  // Mulai countdown timer
  const startCountdown = (seconds = 300) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatCountdown = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Step 1: Login biasa -> cek password -> kalau oke backend kirim OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', { email, password });
      const { otpRequired, sessionId: sid } = response.data;

      if (otpRequired) {
        // Backend mengirim OTP ke email, kita tampilkan form OTP
        setSessionId(sid);
        setOtpStep(true);
        startCountdown(300);
      } else {
        // Tidak ada 2FA (Google login flow), langsung masuk
        const { token, user } = response.data;
        login(token, user);
        navigate(user.role === 'admin' ? '/admin' : '/user');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login Gagal! Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verifikasi OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/verify-otp', { sessionId, otp });
      const { token, user } = response.data;
      login(token, user);
      navigate(user.role === 'admin' ? '/admin' : '/user');
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Kode OTP salah atau sudah kadaluarsa.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Kirim ulang OTP
  const handleResendOtp = async () => {
    setOtpError('');
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', { email, password });
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
        startCountdown(300);
      }
    } catch (err) {
      setOtpError('Gagal mengirim ulang OTP.');
    }
  };

  // Google Login (bypass 2FA karena Google sudah terverifikasi)
  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/google', {
        email: googleUser.email,
        name: googleUser.displayName
      });

      const { token, user } = response.data;
      login(token, user);
      navigate(user.role === 'admin' ? '/admin' : '/user');
    } catch (error) {
      console.error(error);
      setError('Login dengan Google Gagal!');
    }
  };

  // Tampilan Step 2: OTP
  if (otpStep) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="glass max-w-md w-full p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Verifikasi 2FA</h2>
          <p className="text-center text-slate-500 mb-2 text-sm">
            Kode OTP 6-digit telah dikirim ke<br />
            <span className="font-semibold text-slate-700">{email}</span>
          </p>

          {countdown > 0 ? (
            <p className="text-center text-xs text-emerald-600 font-semibold mb-6">
              Kode berlaku selama: <span className="font-mono text-base">{formatCountdown(countdown)}</span>
            </p>
          ) : (
            <p className="text-center text-xs text-rose-500 font-semibold mb-6">
              Kode OTP telah kadaluarsa.
            </p>
          )}

          {otpError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
              {otpError}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kode OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="_ _ _ _ _ _"
                className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {otpLoading ? <Loader className="animate-spin" size={20} /> : 'Verifikasi & Masuk'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleResendOtp}
              disabled={countdown > 0}
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 disabled:text-slate-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              <RefreshCw size={14} /> Kirim Ulang OTP
            </button>
            <button
              onClick={() => { setOtpStep(false); setOtp(''); setOtpError(''); }}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Step 1: Login Normal
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

        {error && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="email@contoh.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Password Anda"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex justify-center items-center gap-2">
            {loading ? <Loader className="animate-spin" size={20} /> : 'Masuk'}
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
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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

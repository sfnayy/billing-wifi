import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wifi, Zap, Globe, Shield, Check, Activity, ArrowRight } from 'lucide-react';

export default function Home() {
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/packages');
        if (res.ok) {
          const data = await res.json();
          setPackages(data.filter(p => !p.isDeleted && p.status === 1));
        }
      } catch (err) {
        console.error("Gagal memuat paket:", err);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white">
      {/* Navbar Section */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-xl">
              <Wifi className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">NetByte Wifi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium transition-colors hidden sm:block">
              Masuk
            </Link>
            <Link to="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold mb-6">
            <Activity size={16} className="animate-pulse" />
            <span>Jaringan Stabil & Super Cepat</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Internet Tanpa Batas <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
              Untuk Kehidupan Digitalmu
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            Nikmati pengalaman browsing, streaming, dan gaming tanpa lag dengan teknologi fiber optik terbaik. Harga jujur, transparan, dan tanpa syarat tersembunyi.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#paket" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-2 group hover:-translate-y-1">
              Lihat Paket
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <Link to="/login" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2">
              Masuk ke Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 border-y border-slate-200/50 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-800">Kenapa Memilih Kami?</h2>
                <p className="text-slate-500 mt-2">Didesain khusus untuk kenyamanan internet Anda di rumah</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-brand-100 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                        <Zap className="text-amber-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Kecepatan Maksimal</h3>
                    <p className="text-slate-500 leading-relaxed">Kecepatan download dan upload yang simetris, memastikan aktivitas online Anda lancar tanpa buffering.</p>
                </div>
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-brand-100 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                        <Globe className="text-brand-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Coverage Luas</h3>
                    <p className="text-slate-500 leading-relaxed">Jaringan infrastruktur kami sudah mencakup hingga ke berbagai pelosok, memastikan koneksi tidak terputus.</p>
                </div>
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-brand-100 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="text-emerald-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Aman & Terlindungi</h3>
                    <p className="text-slate-500 leading-relaxed">Memberikan perlindungan keamanan dasar dari serangan siber sehingga internetan terasa lebih tenang.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Pricing / Packages Section */}
      <div id="paket" className="py-24 bg-slate-50 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Pilihan Paket Terbaik</h2>
                <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">Mulai nikmati layanan internet dari NetByte Wifi, pilih paket yang sesuai kebutuhan Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.length > 0 ? packages.map((plan, index) => (
                    <div key={plan.id} className={`glass rounded-3xl p-8 border ${index === 1 ? 'border-brand-400 shadow-2xl relative' : 'border-slate-200/60 shadow-lg'} hover:-translate-y-2 transition-all duration-300 bg-white/60`}>
                        {index === 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                Paling Laris
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-slate-800">{plan.packageName}</h3>
                        <div className="mt-4 mb-6">
                            <span className="text-4xl font-black text-brand-600">Rp{(plan.price / 1000).toLocaleString('id-ID')}</span>
                            <span className="text-slate-500 font-medium tracking-tight"> Rb / Bln</span>
                        </div>
                        <ul className="space-y-4 mb-8 min-h-[200px]">
                            <li className="flex items-start text-sm text-slate-600 font-medium">
                                <Check size={18} className="text-brand-500 mr-3 mt-0.5 shrink-0"/> 
                                <span>Kecepatan hingga <strong className="text-slate-800">{plan.speed}</strong></span>
                            </li>
                            {plan.description && plan.description.split(',').map((f, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-600 font-medium">
                                    <Check size={18} className="text-brand-500 mr-3 mt-0.5 shrink-0"/> 
                                    <span>{f.trim()}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => navigate('/register')}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${index === 1 ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-brand-500/30' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
                            Pilih Paket
                        </button>
                    </div>
                )) : (
                    <div className="col-span-full text-center text-slate-500 py-16 bg-white rounded-3xl border border-slate-200">
                      <Wifi className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-lg">Belum ada paket yang tersedia saat ini.</p>
                      <p className="text-sm">Silakan hubungi administrator.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Embedded Styles for custom animations not natively in standard tailwind setup without extra plugins */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}

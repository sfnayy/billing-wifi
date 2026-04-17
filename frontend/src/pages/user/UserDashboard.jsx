import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wifi, Check, Activity, CreditCard, Download, FileText, AlertCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function UserDashboard() {
  const [packages, setPackages] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, invRes, subRes, userRes] = await Promise.all([
            fetch('http://localhost:5000/api/packages').catch(()=>null),
            fetch(`http://localhost:5000/api/invoices/customer/${user.id}`).catch(()=>null),
            fetch(`http://localhost:5000/api/subscriptions/customer/${user.id}`).catch(()=>null),
            fetch(`http://localhost:5000/api/users/${user.id}`).catch(()=>null)
        ]);
        
        if (pkgRes && pkgRes.ok) {
          const pkgData = await pkgRes.json();
          setPackages(pkgData.filter(p => !p.isDeleted && p.status === 1));
        }

        if (invRes && invRes.ok) {
            const invData = await invRes.json();
            // Sort to make newest first
            invData.sort((a,b) => new Date(b.createdDate) - new Date(a.createdDate));
            setInvoices(invData);
        }

        if (subRes && subRes.ok) {
            const subData = await subRes.json();
            const activeSub = subData.find(s => s.status === 1);
            if (activeSub) setActiveSubscription(activeSub);
        }

        if (userRes && userRes.ok) {
            const userData = await userRes.json();
            // Force replace state with fresh backend data 
            setUser((prev) => {
                const updated = { ...prev, ...userData };
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
            });
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      }
    };
    if (user.id) fetchData();
  }, []);

  useEffect(() => {
    if (!activeSubscription || !activeSubscription.endDate) return;

    const calculateTimeLeft = () => {
        const difference = +new Date(activeSubscription.endDate) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        setTimeLeft(timeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [activeSubscription]);

  const handlePilihPaket = async (plan) => {
    if(!window.confirm(`Pesan paket ${plan.packageName}? Tagihan akan otomatis dibuat.`)) return;
    setLoading(true);
    try {
      // Request subscription ke backend (Otomatis membuat subscription & invoice baru)
      const subResponse = await axios.post(`http://localhost:5000/api/subscriptions`, {
          customerId: user.id,
          packageId: plan.id,
          companyCode: "NET",
          durationDays: 30
      });

      // Ambil invoiceId dari response backend agar bisa dikirim ke Midtrans
      const { invoiceId, amount } = subResponse.data;

      // Update plan secara optimis ke localStorage
      user.plan = plan.packageName;
      localStorage.setItem('user', JSON.stringify(user));

      alert('Berhasil! Silakan selesaikan pembayaran untuk mengaktifkan paket.');
      // Kirim amount dan invoiceId agar UserPayment tahu invoice mana yang harus dilunasi
      navigate('/user/payment', { state: { amount: amount || plan.price, invoiceIds: invoiceId ? [invoiceId] : [] } }); 
    } catch (error) {
      alert("Gagal memilih paket. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Selamat Pagi';
      if (hour < 15) return 'Selamat Siang';
      if (hour < 18) return 'Selamat Sore';
      return 'Selamat Malam';
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74); 
    doc.text('Bukti Tagihan WiFi (Invoice)', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    doc.text(`Nama Pelanggan: ${user.name}`, 14, 36);
    doc.text(`ID Tagihan: ${invoice.id}`, 14, 42);

    let statusText = 'Tertunda';
    if (invoice.status === 1 || invoice.status === 'success' || invoice.status === 'settlement') statusText = 'Lunas';
    if (invoice.status === -1 || invoice.status === 'cancel' || invoice.status === 'expire') statusText = 'Gagal';

    const tableColumn = ["Deskripsi", "Tanggal", "Batas Waktu", "Status", "Total"];
    const tableRows = [[
        "Tagihan Paket Internet", 
        new Date(invoice.invoiceDate).toLocaleDateString('id-ID'),
        new Date(invoice.dueDate).toLocaleDateString('id-ID'),
        statusText,
        `Rp ${Number(invoice.totalAmount).toLocaleString('id-ID')}`
    ]];

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }
    });

    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  const activeInvoices = invoices.filter(inv => inv.status === 0 || inv.status === 'pending');
  const pastInvoices = invoices.filter(inv => inv.status !== 0 && inv.status !== 'pending');
  
  // Strict definition of an actually paid and active package based on backend data:
  const hasPaidInvoice = activeSubscription && invoices.some(inv => inv.subscriptionId === activeSubscription.id && (inv.status === 1 || inv.status === 'success' || inv.status === 'settlement'));
  const currentPackageDetails = hasPaidInvoice ? packages.find(p => p.id === activeSubscription.packageId) : null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{getGreeting()}, {user.name?.split(' ')[0] || 'Pelanggan'}!</h2>
        <p className="text-slate-500 mt-1">Selamat datang kembali di dashboard pelanggan NetBilling WiFi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Paket Langganan Saya (Hanya muncul jika sudah lunas) */}
          {hasPaidInvoice && currentPackageDetails && (
              <div className="glass rounded-3xl p-8 border border-slate-200/60 shadow-lg relative overflow-hidden bg-gradient-to-br from-white to-blue-50">
                 <div className="absolute top-0 right-0 p-6 opacity-5">
                   <Wifi size={120} />
                 </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={20} className="text-brand-500"/> Paket Langganan Saat Ini</h3>
                 
                 <div className="flex flex-col h-full z-10 relative">
                    <h4 className="text-3xl font-black text-brand-900 mt-4 mb-1">{currentPackageDetails.packageName || 'Layanan Aktif'}</h4>
                    <p className="text-slate-600 font-medium">Kecepatan hingga {currentPackageDetails.speed}</p>

                    <div className="mt-8 bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={16} className="text-brand-600" />
                            <span className="text-sm font-bold text-slate-700">Sisa Waktu Langganan:</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <div className="bg-brand-100 flex-1 rounded-xl p-3 text-center border border-brand-200 shadow-inner">
                                <span className="block text-2xl font-black text-brand-700">{timeLeft.days}</span>
                                <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Hari</span>
                            </div>
                            <div className="text-xl font-bold text-brand-300">:</div>
                            <div className="bg-brand-100 flex-1 rounded-xl p-3 text-center border border-brand-200 shadow-inner">
                                <span className="block text-2xl font-black text-brand-700">{timeLeft.hours}</span>
                                <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Jam</span>
                            </div>
                            <div className="text-xl font-bold text-brand-300">:</div>
                            <div className="bg-brand-100 flex-1 rounded-xl p-3 text-center border border-brand-200 shadow-inner">
                                <span className="block text-2xl font-black text-brand-700">{timeLeft.minutes}</span>
                                <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Menit</span>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
          )}

          {/* Card Invoice Pending & Bayar */}
          <div className={`glass rounded-3xl p-8 border border-slate-200/60 shadow-lg bg-gradient-to-br from-white to-orange-50 ${!hasPaidInvoice ? 'lg:col-span-2' : ''}`}>
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard size={20} className="text-orange-500"/> Tagihan Aktif</h3>
             
             {activeInvoices.length > 0 ? (
                 <div className="space-y-4">
                     {activeInvoices.map(inv => (
                         <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                             <div>
                                 <p className="text-sm text-slate-500 font-medium">Batas Pembayaran: {new Date(inv.dueDate).toLocaleDateString('id-ID')}</p>
                                 <p className="text-xl font-bold text-slate-800">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</p>
                             </div>
                             <button
                               onClick={() => navigate('/user/payment', { state: { amount: inv.totalAmount, invoiceIds: [inv.id] } })} 
                               className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-colors">
                               Bayar
                             </button>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                     <Check className="text-emerald-500 w-12 h-12 mb-2"/>
                     <p className="text-emerald-700 font-bold text-lg">Hore! Tidak ada tagihan tertunggak.</p>
                 </div>
             )}
          </div>
      </div>

      {/* Riwayat Pembayaran */}
      <div className="glass rounded-3xl p-8 border border-slate-200/60 shadow-sm">
         <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText size={20} className="text-brand-600"/> Riwayat Pembayaran</h3>
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-200">
                   <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Validasi Tanggal</th>
                   <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Nominal</th>
                   <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Status</th>
                   <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Aksi</th>
                 </tr>
               </thead>
               <tbody>
                 {pastInvoices.length > 0 ? pastInvoices.map(inv => {
                     let statusText = 'Tertunda';
                     let statusClass = 'bg-amber-100 text-amber-700';
                     if (inv.status === 1 || inv.status === 'success' || inv.status === 'settlement') { statusText = 'Lunas'; statusClass = 'bg-emerald-100 text-emerald-700'; }
                     if (inv.status === -1 || inv.status === 'cancel' || inv.status === 'expire') { statusText = 'Gagal'; statusClass = 'bg-rose-100 text-rose-700'; }

                     return (
                     <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                       <td className="py-4 px-6 text-slate-600 font-medium">{new Date(inv.invoiceDate).toLocaleDateString('id-ID')}</td>
                       <td className="py-4 px-6 font-bold text-slate-800">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</td>
                       <td className="py-4 px-6">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>{statusText}</span>
                       </td>
                       <td className="py-4 px-6 text-right">
                           <button onClick={() => downloadPDF(inv)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                               <Download size={16} /> Unduh PDF
                           </button>
                       </td>
                     </tr>
                 )}) : (
                     <tr>
                         <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">Belum ada riwayat pembayaran.</td>
                     </tr>
                 )}
               </tbody>
             </table>
         </div>
      </div>

      <div className="pt-8 border-t border-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Katalog Paket</h2>
        <p className="text-slate-500 mt-1 mb-8">Pilih atau ubah paket Internet WiFi yang tersedia.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.length > 0 ? packages.map((plan) => {
            const isPlanActive = activeSubscription && activeSubscription.packageId === plan.id && invoices.some(inv => inv.subscriptionId === activeSubscription.id && (inv.status === 1 || inv.status === 'success' || inv.status === 'settlement'));
            const isPlanPending = activeSubscription && activeSubscription.packageId === plan.id && invoices.some(inv => inv.subscriptionId === activeSubscription.id && (inv.status === 0 || inv.status === 'pending'));

            return (
            <div key={plan.id} className="glass rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group bg-white">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Wifi size={100} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{plan.packageName}</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-brand-600">Rp{(plan.price / 1000).toLocaleString('id-ID')}</span>
                <span className="text-slate-500 font-medium tracking-tight"> Rb / Bln</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-slate-600 font-medium">
                  <Check size={16} className="text-brand-500 mr-2 shrink-0"/> Kecepatan {plan.speed}
                </li>
                {plan.description && plan.description.split(',').map((f, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-600 font-medium">
                    <Check size={16} className="text-brand-500 mr-2 shrink-0"/> {f.trim()}
                  </li>
                ))}
              </ul>
              <button 
                disabled={loading || isPlanActive || isPlanPending}
                onClick={() => handlePilihPaket(plan)}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 ${isPlanActive ? 'bg-emerald-500 text-white' : isPlanPending ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
                {isPlanActive ? 'Paket Aktif Saat Ini' : isPlanPending ? 'Menunggu Pembayaran' : 'Pilih Paket Ini'}
              </button>
            </div>
          )}) : (
            <p className="col-span-full text-center text-slate-500 py-8">Belum ada paket yang tersedia.</p>
          )}
        </div>
      </div>
    </div>
  );
}

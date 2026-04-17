import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Loader, CheckCircle, X } from 'lucide-react';

export default function UserProfile({ onClose, asPage = false }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  
  const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userLocal.id}`);
        const data = res.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          gender: data.gender || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      } finally {
        setFetching(false);
      }
    };

    if (userLocal.id) {
      fetchUserData();
    } else {
      setFetching(false);
    }
  }, [userLocal.id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      await axios.put(`http://localhost:5000/api/users/${userLocal.id}`, formData);
      setSuccessMsg("Profil berhasil diperbarui!");
      
      // Update local storage for immediate UI reflection in header if needed
      const updatedUserLocal = { ...userLocal, name: formData.name, email: formData.email, gender: formData.gender, phone: formData.phone, address: formData.address };
      localStorage.setItem('user', JSON.stringify(updatedUserLocal));
      
      setTimeout(() => {
        setSuccessMsg("");
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 flex justify-center text-slate-500"><Loader className="animate-spin" /></div>;
  }

  const FormContent = () => (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Profil Biodata</h2>
        <p className="text-slate-500 mt-1 pr-10">Lengkapi data diri Anda untuk mempermudah pelayanan dan pemasangan WiFi.</p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
          <CheckCircle className="text-emerald-500 w-5 h-5" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-slate-400 w-5 h-5" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Kelamin</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon / WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="text-slate-400 w-5 h-5" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Misal: 081234567890"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-slate-400 w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Lengkap</label>
            <div className="relative">
              <div className="absolute top-3.5 left-4 flex items-start pointer-events-none">
                <MapPin className="text-slate-400 w-5 h-5" />
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Alamat rumah untuk pemasangan WiFi"
                rows="3"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          {!asPage && onClose && (
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all">
              Batal
            </button>
          )}
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none">
            {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </>
  );

  // Mode halaman penuh
  if (asPage) {
    return (
      <div className="max-w-3xl animate-in fade-in duration-500">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Profil Saya</h2>
          <p className="text-slate-500 mt-1">Kelola informasi akun dan data diri Anda.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <FormContent />
        </div>
      </div>
    );
  }

  // Mode modal overlay
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
          <X size={20} />
        </button>
        <FormContent />
      </div>
    </div>
  );
}

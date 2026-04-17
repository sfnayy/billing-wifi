import React, { useState, useEffect } from 'react';
import { Plus, Loader, X, Save, Pencil, Trash2, Package } from 'lucide-react';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    packageName: '',
    speed: '',
    price: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/packages');
      if (!res.ok) throw new Error('Gagal memuat data paket');
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = isEditing 
        ? `http://localhost:5000/api/packages/${editId}` 
        : 'http://localhost:5000/api/packages';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Gagal menyimpan paket');
      
      setShowModal(false);
      fetchPackages();
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus paket ini?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/packages/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus paket');
        fetchPackages();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (pkg) => {
    setFormData({
      packageName: pkg.packageName,
      speed: pkg.speed,
      price: pkg.price,
      description: pkg.description || ''
    });
    setIsEditing(true);
    setEditId(pkg.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ packageName: '', speed: '', price: '', description: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const displayPackages = packages.filter(p => !p.isDeleted);

  if (loading) return (
    <div className="p-8 flex justify-center">
      <Loader className="animate-spin text-brand-500 w-8 h-8"/>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 text-rose-500 rounded-2xl border border-rose-200">Error: {error}</div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Manajemen Paket</h2>
          <p className="text-slate-500 mt-1">Kelola paket layanan internet yang tersedia.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Tambah Paket
        </button>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Nama Paket</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Kecepatan</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Harga / Bulan</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Status</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayPackages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                      <Package size={18} className="text-brand-500" />
                    </div>
                    <span className="font-semibold text-slate-800">{pkg.packageName}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600 font-medium">{pkg.speed}</td>
                <td className="py-4 px-6 font-bold text-brand-600">Rp {Number(pkg.price).toLocaleString('id-ID')}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${pkg.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {pkg.status === 1 ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="py-4 px-6 text-center space-x-2 whitespace-nowrap">
                  <button 
                    onClick={() => openEditModal(pkg)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-brand-200"
                  >
                    <Pencil size={13}/> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(pkg.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-rose-200"
                  >
                    <Trash2 size={13}/> Hapus
                  </button>
                </td>
              </tr>
            ))}
            {displayPackages.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                  <Package size={40} className="mx-auto mb-3 opacity-30"/>
                  Belum ada paket yang ditambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Paket</label>
                <input 
                  type="text" name="packageName" value={formData.packageName} onChange={handleInputChange}
                  placeholder="Misal: Paket Basic"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kecepatan</label>
                <input 
                  type="text" name="speed" value={formData.speed} onChange={handleInputChange}
                  placeholder="Misal: 20 Mbps"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga per Bulan (Rp)</label>
                <input 
                  type="number" name="price" value={formData.price} onChange={handleInputChange}
                  placeholder="Misal: 150000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Fitur <span className="text-slate-400 font-normal">(pisahkan dengan koma)</span></label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange}
                  placeholder="Misal: Cocok untuk streaming, Gaming ringan, Support 24/7"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={16}/>}
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;

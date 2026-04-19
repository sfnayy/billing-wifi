import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Loader, X, Save, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', plan: '', role: '', packageId: '', durationDays: 30 });
  const [isSaving, setIsSaving] = useState(false);
  
  // State Packages
  const [availablePackages, setAvailablePackages] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/packages');
      setAvailablePackages(res.data.filter(pkg => !pkg.isDeleted && pkg.status === 1));
    } catch (error) {
      console.error("Gagal mengambil paket", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Yakin ingin menghapus pelanggan ini beserta seluruh datanya?')) {
      try {
        await axios.delete(`\${import.meta.env.VITE_API_URL}/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Gagal menghapus');
      }
    }
  };

  const handleHapusPaket = async (userToReset) => {
    if(!window.confirm(`Yakin ingin menonaktifkan dan menghapus paket "${userToReset.plan}" dari pengguna ${userToReset.name}?`)) return;
    try {
      // 1. Hapus nama paket dari user
      await axios.put(`\${import.meta.env.VITE_API_URL}/users/${userToReset.id}`, { plan: "" });
      
      // 2. Ambil langganan aktif lalu matikan statusnya (soft delete)
      const subRes = await axios.get(`\${import.meta.env.VITE_API_URL}/subscriptions/customer/${userToReset.id}`);
      const activeSubs = subRes.data.filter(s => s.status === 1);
      
      for (const sub of activeSubs) {
          await axios.put(`\${import.meta.env.VITE_API_URL}/subscriptions/${sub.id}`, { status: -1, isDeleted: 1 });
      }
      
      alert('Paket berhasil dihapus dari pelanggan!');
      fetchUsers();
    } catch(err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus paket pengguna.');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      plan: user.plan || '',
      role: user.role || 'user',
      packageId: '',
      durationDays: 30
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update data user basic
      await axios.put(`\${import.meta.env.VITE_API_URL}/users/${editingUser.id}`, {
        name: editForm.name,
        role: editForm.role,
        plan: editForm.plan
      });

      // Jika admin memilih paket baru, assign ke langganan
      if(editForm.packageId) {
          await axios.post(import.meta.env.VITE_API_URL + '/subscriptions', {
              customerId: editingUser.id,
              packageId: editForm.packageId,
              durationDays: editForm.durationDays
          });
      }

      alert('Data pengguna berhasil diperbarui!');
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Gagal memperbarui data');
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Data Pelanggan WiFi", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["No", "Nama", "Email", "Paket Layanan", "Role"];
    const tableRows = [];

    users.forEach((user, index) => {
      const userData = [
        index + 1,
        user.name,
        user.email,
        user.plan || '-',
        user.role
      ];
      tableRows.push(userData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] }, // brand color approximation (sky/blue)
    });

    doc.save("Laporan_Pelanggan.pdf");
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin text-brand-500 w-8 h-8"/></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Manajemen Pelanggan</h2>
        <button 
          onClick={exportPDF} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl shadow-sm transition-colors"
        >
          <FileDown size={18} />
          Cetak PDF
        </button>
      </div>
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-6 font-semibold text-slate-700 text-sm">Nama</th>
              <th className="py-3 px-6 font-semibold text-slate-700 text-sm">Email</th>
              <th className="py-3 px-6 font-semibold text-slate-700 text-sm">Paket Saat Ini</th>
              <th className="py-3 px-6 font-semibold text-slate-700 text-sm">Status / Role</th>
              <th className="py-3 px-6 font-semibold text-slate-700 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="py-3 px-6 font-medium text-slate-800">{u.name}</td>
                <td className="py-3 px-6 text-slate-600 text-sm">{u.email}</td>
                <td className="py-3 px-6 text-brand-600 font-semibold text-sm">{u.plan || '-'}</td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Aktif'}
                  </span>
                </td>
                <td className="py-3 px-6 text-center space-x-2 whitespace-nowrap">
                  <button onClick={() => openEditModal(u)} className="px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white rounded text-xs font-semibold transition-colors border border-brand-200">Edit</button>
                  {u.plan && (
                      <button onClick={() => handleHapusPaket(u)} className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white rounded text-xs font-semibold transition-colors border border-orange-200">Batalkan Paket</button>
                  )}
                  <button onClick={() => handleDelete(u.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded text-xs font-semibold transition-colors border border-rose-200">Hapus Akun</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" className="text-center py-8 text-slate-400">Belum ada user terdaftar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Edit Data Pengguna</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ganti Paket Layanan (Opsional)</label>
                <select
                  value={editForm.packageId}
                  onChange={(e) => {
                    const selPkg = availablePackages.find(p => p.id === e.target.value);
                    setEditForm({
                       ...editForm, 
                       packageId: e.target.value,
                       plan: selPkg ? selPkg.packageName : editForm.plan
                    });
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                >
                  <option value="">-- Pertahankan Paket Saat Ini --</option>
                  {availablePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.packageName} (Rp {pkg.price.toLocaleString('id-ID')})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Paket aktif saat ini: {editingUser?.plan || 'Belum ada'}</p>
              </div>

              {editForm.packageId && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durasi Langganan (Hari)</label>
                  <input 
                    type="number"
                    min="1"
                    value={editForm.durationDays}
                    onChange={(e) => setEditForm({...editForm, durationDays: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">Harga akan disesuaikan (prorata) jika durasi bukan 30 hari.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Akun</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                >
                  <option value="user">User (Pelanggan)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2 disabled:bg-slate-300"
                >
                  {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5"/> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

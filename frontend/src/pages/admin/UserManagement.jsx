import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Loader } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Yakin ingin menghapus pelanggan ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Gagal menghapus');
      }
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin text-brand-500 w-8 h-8"/></div>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">Manajemen Pelanggan</h2>
      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-200/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Nama</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Email</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Paket Saat Ini</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Role</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="py-4 px-6 font-medium text-slate-800">{u.name}</td>
                <td className="py-4 px-6 text-slate-600">{u.email}</td>
                <td className="py-4 px-6 text-brand-600 font-semibold">{u.plan || '-'}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => alert('Fitur edit menyusul (Update)')} className="p-2 text-slate-400 hover:text-brand-500 transition-colors"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" className="text-center py-8 text-slate-400">Belum ada user terdaftar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

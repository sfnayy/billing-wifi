import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Loader, X, Save, Pencil, Trash2, CreditCard, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function fmtDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '-';
  }
}

function fmtMoney(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '-';
  return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function SubscriptionManagement() {
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customerId: '',
    packageId: '',
    durationDays: 30,
    companyCode: '',
    status: 1,
  });

  const userMap = useMemo(() => {
    const m = {};
    users.forEach(u => { m[u.id] = u; });
    return m;
  }, [users]);

  const pkgMap = useMemo(() => {
    const m = {};
    packages.forEach(p => { m[p.id] = p; });
    return m;
  }, [packages]);

  const resetForm = useCallback(() => {
    setForm({
      customerId: '',
      packageId: '',
      durationDays: 30,
      companyCode: '',
      status: 1,
    });
    setIsEditing(false);
    setEditId(null);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [subsRes, usersRes, pkgRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/subscriptions', { headers }).catch(() => null),
        fetch(import.meta.env.VITE_API_URL + '/users', { headers }).catch(() => null),
        fetch(import.meta.env.VITE_API_URL + '/packages', { headers }).catch(() => null),
      ]);

      const [subsJson, usersJson, pkgJson] = await Promise.all([
        subsRes?.ok ? subsRes.json() : Promise.resolve([]),
        usersRes?.ok ? usersRes.json() : Promise.resolve([]),
        pkgRes?.ok ? pkgRes.json() : Promise.resolve([]),
      ]);

      setSubs(Array.isArray(subsJson) ? subsJson : []);
      setUsers((Array.isArray(usersJson) ? usersJson : []).filter(u => u.role === 'user'));
      setPackages((Array.isArray(pkgJson) ? pkgJson : []).filter(p => !p.isDeleted));
    } catch (e) {
      setError(e?.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (sub) => {
    setForm({
      customerId: sub.customerId || '',
      packageId: sub.packageId || '',
      durationDays: 30,
      companyCode: sub.companyCode || '',
      status: sub.status ?? 1,
    });
    setIsEditing(true);
    setEditId(sub.id);
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      if (!form.customerId || !form.packageId) {
        toast.error("Pelanggan dan paket wajib diisi.");
        return;
      }

      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/subscriptions/${editId}`
        : (import.meta.env.VITE_API_URL + '/subscriptions');

      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            customerId: form.customerId,
            packageId: form.packageId,
            companyCode: form.companyCode,
            status: Number(form.status),
            isDeleted: 0,
          }
        : {
            customerId: form.customerId,
            packageId: form.packageId,
            companyCode: form.companyCode,
            durationDays: Number(form.durationDays) || 30,
          };

      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Gagal menyimpan langganan.');

      setModalOpen(false);
      resetForm();
      await fetchAll();
    } catch (err) {
      toast.error(err?.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (sub) => {
    if (!window.confirm('Yakin ingin membatalkan langganan ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/${sub.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Gagal membatalkan langganan.');
      await fetchAll();
    } catch (e) {
      toast.error(e?.message || "Gagal membatalkan.");
    }
  };

  const visibleSubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = Array.isArray(subs) ? subs : [];
    const activeOnly = list.filter(s => !s.isDeleted);
    if (!q) return activeOnly;

    return activeOnly.filter(s => {
      const u = userMap[s.customerId];
      const p = pkgMap[s.packageId];
      const uName = (u?.name || '').toLowerCase();
      const uEmail = (u?.email || '').toLowerCase();
      const pkgName = (p?.packageName || '').toLowerCase();
      const code = (s.companyCode || '').toLowerCase();
      return uName.includes(q) || uEmail.includes(q) || pkgName.includes(q) || code.includes(q) || (s.id || '').toLowerCase().includes(q);
    });
  }, [subs, search, userMap, pkgMap]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader className="animate-spin text-brand-500 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Manajemen Langganan</h2>
          <p className="text-slate-500 mt-1">CRUD transaksi langganan pelanggan (aktivasi, edit, batal).</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Tambah Langganan
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pelanggan, email, paket, kode perusahaan, atau ID..."
          className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Aksi</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Pelanggan</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Paket</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Periode</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Kode</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleSubs.map((s) => {
              const u = userMap[s.customerId];
              const p = pkgMap[s.packageId];
              const active = (s.status ?? 1) === 1 && !s.isDeleted;
              return (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="py-4 px-6 text-center space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-brand-200"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-rose-200"
                    >
                      <Trash2 size={13} /> Batalkan
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">{u?.name || 'Pelanggan'}</div>
                    <div className="text-xs text-slate-500">{u?.email || '-'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                        <CreditCard size={18} className="text-brand-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{p?.packageName || '-'}</div>
                        <div className="text-xs text-slate-500">{p?.price ? fmtMoney(p.price) : '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    <div>{fmtDate(s.startDate)} → {fmtDate(s.endDate)}</div>
                    <div className="text-xs text-slate-400 font-mono">{(s.id || '').slice(0, 10).toUpperCase()}</div>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-700">{s.companyCode || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {visibleSubs.length === 0 && (
              <tr>
                <td colSpan="6" className="py-14 text-center text-slate-400 font-medium">
                  Belum ada data langganan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Langganan' : 'Tambah Langganan'}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEditing ? 'Update data langganan aktif.' : 'Membuat langganan akan otomatis membuat tagihan (invoice).'}
                </p>
              </div>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pelanggan</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white"
                  required
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paket</label>
                <select
                  value={form.packageId}
                  onChange={(e) => setForm(prev => ({ ...prev, packageId: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white"
                  required
                >
                  <option value="">-- Pilih Paket --</option>
                  {packages.filter(p => !p.isDeleted && p.status === 1).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.packageName} — {fmtMoney(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Durasi (hari)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.durationDays}
                      onChange={(e) => setForm(prev => ({ ...prev, durationDays: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Perusahaan (opsional)</label>
                    <input
                      type="text"
                      value={form.companyCode}
                      onChange={(e) => setForm(prev => ({ ...prev, companyCode: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      placeholder="Misal: NETBILL-01"
                    />
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(prev => ({ ...prev, status: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white"
                    >
                      <option value={1}>Aktif</option>
                      <option value={-1}>Nonaktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Perusahaan (opsional)</label>
                    <input
                      type="text"
                      value={form.companyCode}
                      onChange={(e) => setForm(prev => ({ ...prev, companyCode: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      placeholder="Misal: NETBILL-01"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


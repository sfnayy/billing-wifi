import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Download, FileText, Pencil, Trash2, X, Loader,
  CheckCircle, Search, Filter, AlertTriangle, Save,
  ChevronUp, ChevronDown
} from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'Tertunda', value: 0, cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Lunas', value: 1, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Gagal / Batal', value: -1, cls: 'bg-rose-100 text-rose-700 border-rose-200' },
];

function getStatusInfo(status) {
  if (status === 1 || status === 'success' || status === 'settlement')
    return STATUS_OPTIONS[1];
  if (status === -1 || status === 'expire' || status === 'cancel')
    return STATUS_OPTIONS[2];
  return STATUS_OPTIONS[0];
}

export default function AdminReports() {
  const [invoices, setInvoices] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter & Sort
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('invoiceDate');
  const [sortDir, setSortDir] = useState('desc');

  // Modal Edit
  const [editModal, setEditModal] = useState(null); // invoice object
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');

  // Modal Hapus
  const [deleteModal, setDeleteModal] = useState(null); // invoice object
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, invoicesRes] = await Promise.all([
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/invoices'),
      ]);

      let users = [];
      let rawInvoices = [];

      if (usersRes.ok) users = await usersRes.json();
      if (invoicesRes.ok) rawInvoices = await invoicesRes.json();

      const map = {};
      users.forEach(u => { map[u.id] = u.name || 'Pelanggan'; });
      setUserMap(map);
      setInvoices(rawInvoices);
    } catch (err) {
      console.error('Gagal memuat data laporan:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filter + Sort ────────────────────────────────────
  const filtered = invoices
    .filter(inv => {
      const name = (userMap[inv.customerId] || '').toLowerCase();
      const id = inv.id.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
      const statusInfo = getStatusInfo(inv.status);
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'lunas' && statusInfo.value === 1) ||
        (filterStatus === 'tertunda' && statusInfo.value === 0) ||
        (filterStatus === 'gagal' && statusInfo.value === -1);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'invoiceDate' || sortField === 'dueDate') {
        aVal = new Date(aVal); bVal = new Date(bVal);
      }
      if (sortField === 'totalAmount') { aVal = Number(aVal); bVal = Number(bVal); }
      if (sortField === 'name') { aVal = userMap[a.customerId] || ''; bVal = userMap[b.customerId] || ''; }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-brand-500" />
      : <ChevronDown size={13} className="text-brand-500" />;
  };

  // ─── Edit ─────────────────────────────────────────────
  const openEdit = (inv) => {
    setEditModal(inv);
    setEditSuccess('');
    setEditForm({
      totalAmount: inv.totalAmount,
      status: getStatusInfo(inv.status).value,
      dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : '',
      invoiceDate: inv.invoiceDate ? inv.invoiceDate.slice(0, 10) : '',
      notes: inv.notes || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: Number(editForm.totalAmount),
          status: Number(editForm.status),
          dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
          invoiceDate: editForm.invoiceDate ? new Date(editForm.invoiceDate).toISOString() : undefined,
          notes: editForm.notes,
        }),
      });
      if (!res.ok) throw new Error('Gagal update');
      setEditSuccess('Tagihan berhasil diperbarui!');
      // Update local state
      setInvoices(prev => prev.map(inv =>
        inv.id === editModal.id
          ? {
              ...inv,
              totalAmount: Number(editForm.totalAmount),
              status: Number(editForm.status),
              dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : inv.dueDate,
              invoiceDate: editForm.invoiceDate ? new Date(editForm.invoiceDate).toISOString() : inv.invoiceDate,
              notes: editForm.notes,
            }
          : inv
      ));
      setTimeout(() => { setEditModal(null); setEditSuccess(''); }, 1200);
    } catch {
      alert('Gagal memperbarui tagihan. Coba lagi.');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${deleteModal.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal hapus');
      setInvoices(prev => prev.filter(inv => inv.id !== deleteModal.id));
      setDeleteModal(null);
    } catch {
      alert('Gagal menghapus tagihan.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── PDF Export ───────────────────────────────────────
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Laporan Keuangan — NetBilling WiFi', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 30);

    const tableRows = filtered.map(inv => [
      inv.id.substring(0, 10).toUpperCase(),
      new Date(inv.invoiceDate).toLocaleDateString('id-ID'),
      new Date(inv.dueDate).toLocaleDateString('id-ID'),
      userMap[inv.customerId] || 'Pelanggan',
      `Rp ${Number(inv.totalAmount).toLocaleString('id-ID')}`,
      getStatusInfo(inv.status).label,
    ]);

    doc.autoTable({
      head: [['ID', 'Tgl Invoice', 'Jatuh Tempo', 'Pelanggan', 'Nominal', 'Status']],
      body: tableRows,
      startY: 38,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save('laporan_keuangan_netbilling.pdf');
  };

  // ─── Ringkasan ────────────────────────────────────────
  const totalRevenue = invoices.filter(inv => getStatusInfo(inv.status).value === 1)
    .reduce((s, inv) => s + Number(inv.totalAmount), 0);
  const totalPending = invoices.filter(inv => getStatusInfo(inv.status).value === 0)
    .reduce((s, inv) => s + Number(inv.totalAmount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Manajemen Keuangan</h2>
          <p className="text-slate-500 mt-1">Kelola, edit, hapus, dan ekspor data tagihan pelanggan.</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-colors text-sm font-semibold"
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Menunggu Pembayaran', value: `Rp ${totalPending.toLocaleString('id-ID')}`, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Total Tagihan', value: `${invoices.length} tagihan`, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border rounded-2xl px-5 py-4`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan atau ID tagihan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="tertunda">Tertunda</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {[
                  { label: 'ID Tagihan', field: 'id' },
                  { label: 'Pelanggan', field: 'name' },
                  { label: 'Tgl Invoice', field: 'invoiceDate' },
                  { label: 'Jatuh Tempo', field: 'dueDate' },
                  { label: 'Nominal', field: 'totalAmount' },
                  { label: 'Status', field: 'status' },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-brand-600 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {col.label} <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-4 px-5">
                        <div className="h-4 bg-slate-100 rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-400">
                    <FileText size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data tagihan ditemukan.</p>
                  </td>
                </tr>
              ) : filtered.map(inv => {
                const statusInfo = getStatusInfo(inv.status);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {inv.id.substring(0, 10).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-700 text-sm">
                      {userMap[inv.customerId] || 'Pelanggan'}
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-500">
                      {new Date(inv.invoiceDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-800 text-sm">
                      Rp {Number(inv.totalAmount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(inv)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal(inv)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari{' '}
            <span className="font-semibold text-slate-600">{invoices.length}</span> tagihan
          </div>
        )}
      </div>

      {/* ─── Modal Edit ─────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Tagihan</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  ID: {editModal.id.substring(0, 16).toUpperCase()}
                </p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {editSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                  <CheckCircle size={18} /> {editSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.totalAmount}
                    onChange={e => setEditForm({ ...editForm, totalAmount: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Pembayaran</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white transition-all"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Invoice</label>
                  <input
                    type="date"
                    value={editForm.invoiceDate}
                    onChange={e => setEditForm({ ...editForm, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan (opsional)</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                >
                  {editLoading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal Hapus ────────────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle size={28} className="text-rose-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Hapus Tagihan?</h3>
            <p className="text-sm text-slate-500 text-center mb-1">
              Tagihan untuk <span className="font-semibold text-slate-700">{userMap[deleteModal.customerId] || 'Pelanggan'}</span>
            </p>
            <p className="text-lg font-black text-center text-rose-600 mb-6">
              Rp {Number(deleteModal.totalAmount).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-400 text-center mb-6">
              Data tagihan akan dihapus dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow disabled:opacity-60"
              >
                {deleteLoading ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

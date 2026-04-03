import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, FileText } from 'lucide-react';

const mockTransactions = [
  { id: 'TRX-001', date: '2023-10-01', name: 'Budi Santoso', amount: 150000, status: 'Lunas' },
  { id: 'TRX-002', date: '2023-10-02', name: 'Siti Aminah', amount: 200000, status: 'Lunas' },
  { id: 'TRX-003', date: '2023-10-02', name: 'Andi Wijaya', amount: 150000, status: 'Tertunda' },
  { id: 'TRX-004', date: '2023-10-03', name: 'Rina Melati', amount: 300000, status: 'Lunas' },
  { id: 'TRX-005', date: '2023-10-05', name: 'Eko Prasetyo', amount: 150000, status: 'Gagal' },
];

export default function Reports() {

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74); // Brand color
    doc.text('Laporan Tagihan WiFi', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    // Table
    const tableColumn = ["ID Transaksi", "Tanggal", "Pelanggan", "Jumlah", "Status"];
    const tableRows = [];

    mockTransactions.forEach(trx => {
      const trxData = [
        trx.id,
        trx.date,
        trx.name,
        `Rp ${trx.amount.toLocaleString('id-ID')}`,
        trx.status
      ];
      tableRows.push(trxData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save('laporan_tagihan_wifi.pdf');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Laporan Keuangan</h2>
          <p className="text-slate-500 mt-1">Pantau riwayat transaksi dan ekspor data laporan.</p>
        </div>
        
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium shadow-md transition-colors"
        >
          <Download size={18} />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-4 px-6 font-semibold text-slate-600 text-sm">ID Transaksi</th>
                <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Tanggal</th>
                <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Pelanggan</th>
                <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Jumlah</th>
                <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((trx, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    {trx.id}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{trx.date}</td>
                  <td className="py-4 px-6 text-slate-800 font-medium">{trx.name}</td>
                  <td className="py-4 px-6 text-slate-700">Rp {trx.amount.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trx.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 
                      trx.status === 'Tertunda' ? 'bg-amber-100 text-amber-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

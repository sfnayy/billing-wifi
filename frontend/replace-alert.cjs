const fs = require('fs');

const files = [
  'src/pages/user/UserProfile.jsx',
  'src/pages/user/UserPayment.jsx',
  'src/pages/user/UserDashboard.jsx',
  'src/pages/Register.jsx',
  'src/pages/admin/UserManagement.jsx',
  'src/pages/admin/SubscriptionManagement.jsx',
  'src/pages/admin/PackageManagement.jsx',
  'src/pages/admin/AdminReports.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // add import toast
    if (!content.includes('import toast from \'react-hot-toast\';')) {
        // Find the last import
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + "import toast from 'react-hot-toast';\n" + content.slice(endOfLine + 1);
        } else {
            content = "import toast from 'react-hot-toast';\n" + content;
        }
    }

    // replace specific alerts
    content = content.replace(/alert\("Gagal memperbarui profil."\);/g, 'toast.error("Gagal memperbarui profil.");');
    content = content.replace(/alert\("Anda belum memilih paket atau tidak ada tagihan aktif."\);/g, 'toast.error("Anda belum memilih paket atau tidak ada tagihan aktif.");');
    content = content.replace(/alert\("Midtrans Snap belum dimuat! Pastikan Client Key benar di index.html"\);/g, 'toast.error("Midtrans Snap belum dimuat! Pastikan Client Key benar di index.html");');
    content = content.replace(/alert\("Pembayaran Berhasil! Terima kasih."\);/g, 'toast.success("Pembayaran Berhasil! Terima kasih.");');
    content = content.replace(/alert\("Menunggu pembayaran..."\);/g, "toast('Menunggu pembayaran...', { icon: '⏳' });");
    content = content.replace(/alert\("Pembayaran Gagal!"\);/g, 'toast.error("Pembayaran Gagal!");');
    content = content.replace(/alert\("Anda membatalkan popup pembayaran Midtrans. Tagihan belum dibayar."\);/g, 'toast.error("Anda membatalkan popup pembayaran Midtrans. Tagihan belum dibayar.");');
    content = content.replace(/alert\("Terjadi kesalahan sistem saat mengambil transaksi. Pastikan backend aktif."\);/g, 'toast.error("Terjadi kesalahan sistem saat mengambil transaksi. Pastikan backend aktif.");');
    content = content.replace(/alert\('Berhasil! Silakan selesaikan pembayaran untuk mengaktifkan paket.'\);/g, 'toast.success("Berhasil! Silakan selesaikan pembayaran untuk mengaktifkan paket.");');
    content = content.replace(/alert\(`Gagal memilih paket: \$\{errMsg\}`\);/g, 'toast.error(`Gagal memilih paket: ${errMsg}`);');
    content = content.replace(/alert\('Registrasi Berhasil! Silakan Login.'\);/g, 'toast.success("Registrasi Berhasil! Silakan Login.");');
    content = content.replace(/alert\('Gagal mengambil data user'\);/g, 'toast.error("Gagal mengambil data user");');
    content = content.replace(/alert\('Gagal menghapus'\);/g, 'toast.error("Gagal menghapus");');
    content = content.replace(/alert\('Paket berhasil dihapus dari pelanggan!'\);/g, 'toast.success("Paket berhasil dihapus dari pelanggan!");');
    content = content.replace(/alert\('Terjadi kesalahan saat menghapus paket pengguna.'\);/g, 'toast.error("Terjadi kesalahan saat menghapus paket pengguna.");');
    content = content.replace(/alert\('Data pengguna berhasil diperbarui!'\);/g, 'toast.success("Data pengguna berhasil diperbarui!");');
    content = content.replace(/alert\('Gagal memperbarui data'\);/g, 'toast.error("Gagal memperbarui data");');
    content = content.replace(/alert\('Pelanggan dan paket wajib diisi.'\);/g, 'toast.error("Pelanggan dan paket wajib diisi.");');
    content = content.replace(/alert\(err\?\.message \|\| 'Terjadi kesalahan.'\);/g, 'toast.error(err?.message || "Terjadi kesalahan.");');
    content = content.replace(/alert\(e\?\.message \|\| 'Gagal membatalkan.'\);/g, 'toast.error(e?.message || "Gagal membatalkan.");');
    content = content.replace(/alert\(err\.message\);/g, 'toast.error(err.message);');
    content = content.replace(/alert\(err\?\.message \|\| 'Gagal membuat tagihan.'\);/g, 'toast.error(err?.message || "Gagal membuat tagihan.");');
    content = content.replace(/alert\('Gagal memperbarui tagihan. Coba lagi.'\);/g, 'toast.error("Gagal memperbarui tagihan. Coba lagi.");');
    content = content.replace(/alert\('Gagal menghapus tagihan.'\);/g, 'toast.error("Gagal menghapus tagihan.");');
    
    fs.writeFileSync(f, content);
    console.log('Processed ' + f);
  }
});

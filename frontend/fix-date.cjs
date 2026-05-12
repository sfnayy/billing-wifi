const fs = require('fs');
const files = [
  'src/pages/user/UserDashboard.jsx',
  'src/pages/admin/UserManagement.jsx',
  'src/pages/admin/SubscriptionManagement.jsx',
  'src/pages/admin/AdminReports.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/components/Reports.jsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/toLocaleDateString\('id-ID'\)/g, "toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })");
    // Also format toLocaleString('id-ID') if used for dates
    content = content.replace(/toLocaleString\('id-ID'\)/g, "toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })");
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
